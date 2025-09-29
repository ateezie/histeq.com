#!/bin/bash

# WordPress Backup Restore Script
# Created: September 29, 2025 at 12:46:32
# Backup Directory: wordpress-backup-20250929-124632

set -e

BACKUP_DIR="$(dirname "$0")"
PROJECT_ROOT="$(dirname "$(dirname "$BACKUP_DIR")")"

echo "WordPress Backup Restore Script"
echo "==============================="
echo "Backup created: 2025-09-29 12:46"
echo "Backup directory: $BACKUP_DIR"
echo "Project root: $PROJECT_ROOT"
echo ""

# Function to restore database
restore_database() {
    echo "🗄️  Restoring database..."
    if [ ! -f "$BACKUP_DIR/database.sql" ]; then
        echo "❌ Database backup file not found!"
        exit 1
    fi
    
    # Check if Docker containers are running
    if ! docker-compose ps | grep -q "Up"; then
        echo "🐳 Starting Docker containers..."
        docker-compose up -d
        echo "⏳ Waiting for database to be ready..."
        sleep 30
    fi
    
    # Restore database
    docker exec -i histeqcom-db-1 mysql -u wordpress -pwordpress wordpress < "$BACKUP_DIR/database.sql"
    echo "✅ Database restored successfully"
}

# Function to restore WordPress files
restore_files() {
    echo "📁 Restoring WordPress files..."
    
    if [ ! -f "$BACKUP_DIR/wordpress-core.tar.gz" ]; then
        echo "❌ WordPress files backup not found!"
        exit 1
    fi
    
    cd "$PROJECT_ROOT"
    
    # Create backup of current files (just in case)
    if [ -d "wp-content" ]; then
        echo "📋 Creating backup of current files..."
        tar -czf "current-backup-$(date +%Y%m%d-%H%M%S).tar.gz" wp-content/ wp-config.php 2>/dev/null || true
    fi
    
    # Extract files
    echo "📦 Extracting WordPress files..."
    tar -xzf "$BACKUP_DIR/wordpress-core.tar.gz"
    
    echo "✅ WordPress files restored successfully"
}

# Function to verify backup integrity
verify_backup() {
    echo "🔍 Verifying backup integrity..."
    
    # Check database backup
    if [ -f "$BACKUP_DIR/database.sql" ]; then
        echo "✅ Database backup found ($(du -h "$BACKUP_DIR/database.sql" | cut -f1))"
    else
        echo "❌ Database backup missing"
        return 1
    fi
    
    # Check WordPress files backup
    if [ -f "$BACKUP_DIR/wordpress-core.tar.gz" ]; then
        echo "✅ WordPress core backup found ($(du -h "$BACKUP_DIR/wordpress-core.tar.gz" | cut -f1))"
        # Test if the archive is valid
        if tar -tzf "$BACKUP_DIR/wordpress-core.tar.gz" > /dev/null 2>&1; then
            echo "✅ WordPress core archive is valid"
        else
            echo "❌ WordPress core archive is corrupted"
            return 1
        fi
    else
        echo "❌ WordPress core backup missing"
        return 1
    fi
    
    if [ -f "$BACKUP_DIR/wordpress-files.tar.gz" ]; then
        echo "✅ WordPress files backup found ($(du -h "$BACKUP_DIR/wordpress-files.tar.gz" | cut -f1))"
        # Test if the archive is valid
        if tar -tzf "$BACKUP_DIR/wordpress-files.tar.gz" > /dev/null 2>&1; then
            echo "✅ WordPress files archive is valid"
        else
            echo "❌ WordPress files archive is corrupted"
            return 1
        fi
    else
        echo "❌ WordPress files backup missing"
        return 1
    fi
    
    echo "✅ All backup files are present and valid"
}

# Function to show backup info
info() {
    echo "📊 Backup Information"
    echo "===================="
    echo "Created: September 29, 2025 at 12:46:32 (Afternoon)"
    echo "Database size: $(du -h "$BACKUP_DIR/database.sql" 2>/dev/null | cut -f1 || echo "N/A")"
    echo "WordPress core: $(du -h "$BACKUP_DIR/wordpress-core.tar.gz" 2>/dev/null | cut -f1 || echo "N/A")"
    echo "WordPress files: $(du -h "$BACKUP_DIR/wordpress-files.tar.gz" 2>/dev/null | cut -f1 || echo "N/A")"
    echo ""
    echo "📈 Backup Timeline:"
    echo "- 2025-09-28 16:15 - Original backup (736KB DB)"
    echo "- 2025-09-29 03:05 - Morning backup (1.3MB DB) - Major content growth"
    echo "- 2025-09-29 12:46 - Afternoon backup (1.3MB DB) - Current stable state ⭐"
    echo ""
    echo "🔄 Change Analysis:"
    echo "- Database stable at 1.3MB since morning (no new content changes)"
    echo "- Files remain consistent at ~166MB (stable development state)"
    echo "- This represents a stable checkpoint after morning's work"
}

# Function to compare with other backups
compare() {
    echo "📊 Backup Comparison"
    echo "==================="
    echo "Available backups in chronological order:"
    echo ""
    
    for backup in $(ls -1 ../*/database.sql 2>/dev/null | xargs -I {} dirname {} | sort); do
        backup_name=$(basename "$backup")
        db_size=$(du -h "$backup/database.sql" 2>/dev/null | cut -f1 || echo "N/A")
        core_size=$(du -h "$backup/wordpress-core.tar.gz" 2>/dev/null | cut -f1 || echo "N/A")
        
        if [ "$backup" = "$BACKUP_DIR" ]; then
            echo "➤ $backup_name (CURRENT) - DB: $db_size, Core: $core_size"
        else
            echo "  $backup_name - DB: $db_size, Core: $core_size"
        fi
    done
}

# Main script logic
case "${1:-help}" in
    "verify")
        verify_backup
        ;;
    "info")
        info
        ;;
    "compare")
        compare
        ;;
    "database")
        restore_database
        ;;
    "files")
        restore_files
        ;;
    "full")
        verify_backup
        echo ""
        read -p "⚠️  This will replace your current WordPress installation. Continue? (y/N) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            restore_files
            restore_database
            echo ""
            echo "🎉 Full restore completed successfully!"
            echo "Your WordPress site should be available at http://localhost:8080"
        else
            echo "Restore cancelled."
        fi
        ;;
    "help"|*)
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  info      - Show backup information and timeline"
        echo "  compare   - Compare with other available backups"
        echo "  verify    - Verify backup integrity"
        echo "  database  - Restore database only"
        echo "  files     - Restore WordPress files only"
        echo "  full      - Full restore (files + database)"
        echo "  help      - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 info       # Show backup details and timeline"
        echo "  $0 compare    # Compare with other backups"
        echo "  $0 verify     # Check if backup files are valid"
        echo "  $0 full       # Complete restore"
        ;;
esac