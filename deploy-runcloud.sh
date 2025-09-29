#!/bin/bash

# RunCloud Deployment Script for Historic Equity Inc. WordPress Theme
# Version: 1.0.0
# Usage: ./deploy-runcloud.sh [artifact-name] [environment]

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOYMENT_LOG="/var/log/historic-equity-deploy.log"
BACKUP_DIR="/var/backups/historic-equity"
THEME_DIR="/home/runcloud/webapps/histeq/wp-content/themes/historic-equity"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    echo -e "${timestamp} [${level}] ${message}" | tee -a "${DEPLOYMENT_LOG}"

    case $level in
        "ERROR")
            echo -e "${RED}[ERROR]${NC} ${message}" >&2
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} ${message}"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} ${message}"
            ;;
        "INFO")
            echo -e "${BLUE}[INFO]${NC} ${message}"
            ;;
    esac
}

# Error handling
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log "ERROR" "Deployment failed with exit code $exit_code"
        log "INFO" "Check deployment log: $DEPLOYMENT_LOG"
    fi
}
trap cleanup EXIT

# Help function
show_help() {
    cat << EOF
Historic Equity Inc. - RunCloud Deployment Script

Usage: $0 [OPTIONS] [ARTIFACT_NAME] [ENVIRONMENT]

Arguments:
    ARTIFACT_NAME   Name of the deployment artifact (optional)
    ENVIRONMENT     Deployment environment: staging|production (default: staging)

Options:
    -h, --help      Show this help message
    -v, --verbose   Enable verbose output
    -d, --dry-run   Show what would be deployed without making changes
    -b, --backup    Create backup before deployment (default: enabled)
    --no-backup     Skip backup creation

Examples:
    $0                                          # Deploy latest from current directory
    $0 historic-equity-deployment staging       # Deploy specific artifact to staging
    $0 --dry-run                               # Preview deployment
    $0 --no-backup production                  # Deploy to production without backup

EOF
}

# Parse command line arguments
VERBOSE=0
DRY_RUN=0
CREATE_BACKUP=1
ARTIFACT_NAME=""
ENVIRONMENT="staging"

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=1
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=1
            shift
            ;;
        -b|--backup)
            CREATE_BACKUP=1
            shift
            ;;
        --no-backup)
            CREATE_BACKUP=0
            shift
            ;;
        *)
            if [ -z "$ARTIFACT_NAME" ]; then
                ARTIFACT_NAME="$1"
            elif [ -z "$ENVIRONMENT" ]; then
                ENVIRONMENT="$1"
            else
                log "ERROR" "Unknown argument: $1"
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    log "ERROR" "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
    exit 1
fi

# Start deployment
log "INFO" "Starting Historic Equity deployment..."
log "INFO" "Environment: $ENVIRONMENT"
log "INFO" "Artifact: ${ARTIFACT_NAME:-'current directory'}"
log "INFO" "Dry run: $([ $DRY_RUN -eq 1 ] && echo 'Yes' || echo 'No')"

# Pre-deployment checks
log "INFO" "Running pre-deployment checks..."

# Check if we're running as the right user
if [ "$(id -u)" -eq 0 ]; then
    log "WARNING" "Running as root. Consider using a dedicated deployment user."
fi

# Check directory permissions
if [ ! -w "$THEME_DIR" ] && [ $DRY_RUN -eq 0 ]; then
    log "ERROR" "Cannot write to theme directory: $THEME_DIR"
    exit 1
fi

# Create backup if enabled
if [ $CREATE_BACKUP -eq 1 ]; then
    log "INFO" "Creating backup..."

    if [ $DRY_RUN -eq 0 ]; then
        mkdir -p "$BACKUP_DIR"
        backup_file="$BACKUP_DIR/theme-backup-$(date +%Y%m%d-%H%M%S).tar.gz"

        if [ -d "$THEME_DIR" ]; then
            tar -czf "$backup_file" -C "$(dirname "$THEME_DIR")" "$(basename "$THEME_DIR")"
            log "SUCCESS" "Backup created: $backup_file"
        else
            log "WARNING" "Theme directory not found, skipping backup"
        fi
    else
        log "INFO" "[DRY RUN] Would create backup at: $BACKUP_DIR/theme-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    fi
fi

# Determine source directory
if [ -n "$ARTIFACT_NAME" ]; then
    # If artifact name provided, look for it in common locations
    SOURCE_DIR=""

    # Check if it's a path to extracted artifact
    if [ -d "$ARTIFACT_NAME/theme" ]; then
        SOURCE_DIR="$ARTIFACT_NAME/theme"
    elif [ -d "$ARTIFACT_NAME" ]; then
        SOURCE_DIR="$ARTIFACT_NAME"
    else
        log "ERROR" "Artifact not found: $ARTIFACT_NAME"
        exit 1
    fi
else
    # Use current directory theme
    if [ -d "$SCRIPT_DIR/wp-content/themes/historic-equity" ]; then
        SOURCE_DIR="$SCRIPT_DIR/wp-content/themes/historic-equity"
    elif [ -d "$SCRIPT_DIR/theme" ]; then
        SOURCE_DIR="$SCRIPT_DIR/theme"
    else
        log "ERROR" "No theme source found in current directory"
        exit 1
    fi
fi

log "INFO" "Source directory: $SOURCE_DIR"

# Validate source
if [ ! -f "$SOURCE_DIR/functions.php" ]; then
    log "ERROR" "Invalid WordPress theme source (functions.php not found)"
    exit 1
fi

if [ ! -f "$SOURCE_DIR/style.css" ]; then
    log "ERROR" "Invalid WordPress theme source (style.css not found)"
    exit 1
fi

# Check if built assets exist
if [ ! -d "$SOURCE_DIR/static/dist" ]; then
    log "WARNING" "Built assets not found. Theme may not function correctly."
fi

# Deploy theme files
log "INFO" "Deploying theme files..."

if [ $DRY_RUN -eq 1 ]; then
    log "INFO" "[DRY RUN] Would sync files from: $SOURCE_DIR"
    log "INFO" "[DRY RUN] Would sync files to: $THEME_DIR"

    # Show what files would be copied
    rsync -av --dry-run \
        --exclude='.git*' \
        --exclude='node_modules' \
        --exclude='*.md' \
        --exclude='tests' \
        --exclude='playwright*' \
        --exclude='package*.json' \
        --exclude='webpack.config.js' \
        --exclude='tailwind.config.js' \
        --exclude='postcss.config.js' \
        "$SOURCE_DIR/" "$THEME_DIR/"
else
    # Create theme directory if it doesn't exist
    mkdir -p "$(dirname "$THEME_DIR")"

    # Sync files
    rsync -av \
        --exclude='.git*' \
        --exclude='node_modules' \
        --exclude='*.md' \
        --exclude='tests' \
        --exclude='playwright*' \
        --exclude='package*.json' \
        --exclude='webpack.config.js' \
        --exclude='tailwind.config.js' \
        --exclude='postcss.config.js' \
        "$SOURCE_DIR/" "$THEME_DIR/"

    # Set proper permissions
    find "$THEME_DIR" -type f -exec chmod 644 {} \;
    find "$THEME_DIR" -type d -exec chmod 755 {} \;

    # Make sure PHP files are executable by web server
    find "$THEME_DIR" -name "*.php" -exec chmod 644 {} \;

    log "SUCCESS" "Theme files deployed successfully"
fi

# Post-deployment checks
log "INFO" "Running post-deployment checks..."

if [ $DRY_RUN -eq 0 ]; then
    # Verify critical files exist
    critical_files=("functions.php" "style.css" "index.php")

    for file in "${critical_files[@]}"; do
        if [ ! -f "$THEME_DIR/$file" ]; then
            log "ERROR" "Critical file missing after deployment: $file"
            exit 1
        fi
    done

    # Check if dist directory exists and has content
    if [ -d "$THEME_DIR/static/dist" ] && [ "$(ls -A "$THEME_DIR/static/dist")" ]; then
        log "SUCCESS" "Built assets deployed successfully"
    else
        log "WARNING" "Built assets not found or empty"
    fi

    log "SUCCESS" "Post-deployment checks completed"
else
    log "INFO" "[DRY RUN] Would verify critical files: functions.php, style.css, index.php"
    log "INFO" "[DRY RUN] Would check built assets in static/dist/"
fi

# Final summary
log "SUCCESS" "Historic Equity deployment completed successfully!"
log "INFO" "Environment: $ENVIRONMENT"
log "INFO" "Source: $SOURCE_DIR"
log "INFO" "Destination: $THEME_DIR"

if [ $DRY_RUN -eq 0 ]; then
    log "INFO" "Next steps:"
    log "INFO" "1. Clear any WordPress caches"
    log "INFO" "2. Test website functionality"
    log "INFO" "3. Monitor error logs"

    if [ "$ENVIRONMENT" = "staging" ]; then
        log "INFO" "4. Staging URL: http://histeq.com.vbb6nz2mqj-lxd6rweqy39g.p.temp-site.link/"
    fi
fi

log "INFO" "Deployment log: $DEPLOYMENT_LOG"