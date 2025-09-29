# WordPress Backup - histeq.com

**Created:** September 28, 2025 at 16:15:05  
**Site URL:** http://localhost:8080  
**Docker Environment:** Yes

## Backup Contents

### 📁 Files Included

1. **`database.sql`** (736KB)
   - Complete MySQL dump of the WordPress database
   - Includes all posts, pages, users, settings, and metadata
   - Database: `wordpress`
   - User: `wordpress`

2. **`wordpress-core.tar.gz`** (148MB)
   - Complete WordPress installation including:
     - `/wp-content/` - themes, plugins, uploads
     - `/wp-admin/` - WordPress admin files
     - `/wp-includes/` - WordPress core files
     - `wp-config.php` - configuration file
     - All `wp-*.php` core files

3. **`wordpress-files.tar.gz`** (110MB)
   - Selective backup of essential files
   - Excludes large development files (screenshots, node_modules, etc.)

4. **`restore.sh`** - Automated restore script

## System Information

- **WordPress Version:** Latest (Docker image)
- **PHP Version:** As per WordPress Docker image
- **MySQL Version:** 8.0
- **Docker Compose:** Yes (see docker-compose.yml)

### Docker Services
- `histeqcom-wordpress-1` - WordPress container (port 8080)
- `histeqcom-db-1` - MySQL 8.0 database
- `histeqcom-phpmyadmin-1` - phpMyAdmin (port 8081)

## How to Restore

### Quick Restore (Automated)
```bash
# Verify backup integrity first
./restore.sh verify

# Full restore (files + database)
./restore.sh full
```

### Manual Restore

#### 1. Database Restore
```bash
# Make sure Docker containers are running
docker-compose up -d

# Wait for database to be ready (30 seconds)
sleep 30

# Restore database
docker exec -i histeqcom-db-1 mysql -u wordpress -pwordpress wordpress < database.sql
```

#### 2. Files Restore
```bash
# Extract WordPress files to project root
cd /path/to/histeq.com
tar -xzf /path/to/backup/wordpress-core.tar.gz
```

## Backup Strategy Recommendations

### Regular Backups
- **Daily:** Database backup (lightweight - ~736KB)
- **Weekly:** Full site backup (files + database)
- **Before updates:** Always backup before WordPress/plugin updates

### Automation Script
```bash
#!/bin/bash
# Add to crontab for daily backups
BACKUP_DIR="backups/wordpress-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
docker exec histeqcom-db-1 mysqldump -u wordpress -pwordpress wordpress > "$BACKUP_DIR/database.sql"
```

## Notes

- This backup was created from a local Docker development environment
- Database credentials: `wordpress/wordpress` (development only)
- Site URL configured for `http://localhost:8080`
- Large media files and development artifacts were excluded from selective backup

## Verification

The backup has been verified for:
- ✅ Database dump integrity
- ✅ Archive file validity
- ✅ Essential WordPress files inclusion

## Support

For restore issues:
1. Ensure Docker is running: `docker-compose ps`
2. Check database connectivity: `docker exec histeqcom-db-1 mysql -u wordpress -pwordpress -e "SHOW DATABASES;"`
3. Verify file permissions after restore
4. Clear any caching if site doesn't load properly

---
*Backup created using WordPress backup script*