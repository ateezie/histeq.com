# Docker Restart Requirements for Historic Equity Inc. WordPress Site

## Overview
The Historic Equity Inc. WordPress site runs in a Docker container environment. Certain changes to styles and JavaScript files require a Docker container restart to take effect properly due to caching mechanisms and file watching limitations.

## When Docker Restart is Required

### 🎨 CSS/SCSS Changes
**Files that require restart:**
- `/wp-content/themes/historic-equity/static/scss/**/*.scss`
- `/wp-content/themes/historic-equity/static/css/**/*.css`
- `/wp-content/themes/historic-equity/style.css`

**Why restart needed:**
- Webpack build process caches compiled CSS
- SCSS compilation pipeline needs to regenerate
- Browser caching of stylesheet URLs

### 📝 JavaScript Changes
**Files that require restart:**
- `/wp-content/themes/historic-equity/static/js/**/*.js`
- Webpack entry points and modules
- Component-level JavaScript files

**Why restart needed:**
- Webpack hot module replacement limitations
- JavaScript bundling and minification process
- Module dependency resolution

### 🔧 Configuration Changes
**Files that require restart:**
- `webpack.config.js`
- `package.json` (when dependencies change)
- `.env` files
- Docker configuration files
- PHP configuration changes

## Files That Do NOT Require Restart

### ✅ Template Changes (Hot Reload)
- `/wp-content/themes/historic-equity/templates/**/*.twig`
- Timber/Twig template modifications
- PHP files (functions.php, etc.)

### ✅ Content Changes
- WordPress admin content updates
- ACF field modifications
- Database content changes

## How to Restart Docker Container

### Method 1: Docker Compose Restart (Recommended)
```bash
# From project root directory
docker-compose restart

# Or restart specific service
docker-compose restart wordpress
```

### Method 2: Stop and Start
```bash
# Stop all services
docker-compose down

# Start all services
docker-compose up -d
```

### Method 3: Rebuild (For major changes)
```bash
# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Verification Steps After Restart

### 1. Check Container Status
```bash
docker-compose ps
```

### 2. Verify Site Accessibility
- Navigate to `http://localhost:8080`
- Check all pages load correctly
- Test mobile navigation functionality

### 3. Verify Asset Loading
- Open browser developer tools
- Check Network tab for CSS/JS 200 status codes
- Verify no 404 errors for assets

### 4. Clear Browser Cache
- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Or open in incognito/private browsing mode

## Common Issues and Solutions

### Problem: CSS Changes Not Appearing
**Solution:**
1. Restart Docker container
2. Clear browser cache
3. Check webpack build process completed

### Problem: JavaScript Not Working
**Solution:**
1. Check browser console for errors
2. Restart Docker container
3. Verify JavaScript file paths in templates

### Problem: Mobile Menu Not Functioning
**Solution:**
1. Restart Docker container (JavaScript rebuild needed)
2. Test mobile menu functionality
3. Check console for JavaScript errors

## Development Workflow Best Practices

### For CSS/SCSS Development
```bash
# 1. Make SCSS changes
# 2. Restart container
docker-compose restart

# 3. Test changes at localhost:8080
# 4. Clear browser cache if needed
```

### For JavaScript Development
```bash
# 1. Make JS changes
# 2. Restart container
docker-compose restart

# 3. Test functionality
# 4. Check browser console for errors
```

### For Template Development
```bash
# 1. Make Twig template changes
# 2. No restart needed - changes appear immediately
# 3. Test at localhost:8080
```

## Performance Considerations

### Restart Time
- Typical restart: 30-60 seconds
- Full rebuild: 2-5 minutes
- Hot template changes: Immediate

### Asset Caching
- Browser cache: Clear manually after restart
- Webpack cache: Cleared automatically on restart
- WordPress cache: Managed by plugins/settings

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs

# Remove containers and start fresh
docker-compose down --remove-orphans
docker-compose up -d
```

### Assets Not Loading
```bash
# Rebuild webpack assets
docker-compose exec wordpress npm run build

# Or full container rebuild
docker-compose build --no-cache wordpress
```

### Permission Issues
```bash
# Fix file permissions
docker-compose exec wordpress chown -R www-data:www-data /var/www/html

# Or reset container volumes
docker-compose down -v
docker-compose up -d
```

## Quick Reference Commands

| Change Type | Restart Required | Command | Time |
|-------------|------------------|---------|------|
| Twig Templates | ❌ No | N/A | Immediate |
| SCSS/CSS | ✅ Yes | `docker-compose restart` | 30-60s |
| JavaScript | ✅ Yes | `docker-compose restart` | 30-60s |
| PHP Functions | ❌ No | N/A | Immediate |
| Webpack Config | ✅ Yes | `docker-compose build --no-cache` | 2-5min |

## Client Presentation Notes

When demonstrating the site to clients:
1. Ensure Docker container is running and stable
2. Test all pages before presentation
3. Keep browser cache cleared
4. Have backup screenshots ready in case of technical issues

---

*Last Updated: September 2025*
*Historic Equity Inc. WordPress Development Documentation*