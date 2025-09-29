# Historic Equity Inc. - Deployment Guide

## Overview

This guide covers the CI/CD pipeline and deployment process for the Historic Equity Inc. WordPress website. The deployment strategy uses GitHub Actions for automated building and artifact creation, with RunCloud for hosting.

## Architecture

```
GitHub Repository (Source Code)
    ↓
GitHub Actions (Build & Test)
    ↓
Deployment Artifacts
    ↓
RunCloud Staging Server
    ↓
RunCloud Production Server (Manual)
```

## Key Features

- ✅ **Artifact-based deployment** - No build files committed to repository
- ✅ **Automated asset building** - Webpack compilation in CI/CD
- ✅ **Multi-environment support** - Staging and production workflows
- ✅ **Rollback capabilities** - Automated backups before deployment
- ✅ **Security** - No hardcoded credentials or tokens
- ✅ **Quality assurance** - Automated testing and validation

## Workflows

### 1. Production Deployment (`deploy.yml`)

**Triggers:**
- Push to `master` branch
- Manual workflow dispatch

**Process:**
1. Install Node.js dependencies
2. Build theme assets with Webpack
3. Validate build output
4. Create deployment artifact
5. Upload artifact to GitHub
6. Trigger RunCloud webhook (if configured)
7. Generate deployment summary

**Artifact Contents:**
- WordPress theme files (excluding dev dependencies)
- Built CSS and JavaScript assets
- Deployment metadata and configuration

### 2. Staging Deployment (`staging-deploy.yml`)

**Triggers:**
- Pull requests to `master` branch
- Manual workflow dispatch with environment selection

**Process:**
1. Build and test theme assets
2. Run quality checks and validation
3. Create staging-specific artifact
4. Upload to GitHub with PR comment
5. Provide manual deployment instructions

### 3. Testing (`test.yml`)

**Triggers:**
- Pull requests affecting theme files
- Pushes to feature/fix branches

**Process:**
1. Test multiple Node.js versions (18, 20)
2. Validate dependencies and configuration
3. Build theme assets
4. Verify WordPress theme structure
5. Run security checks
6. Upload failure artifacts if needed

## Repository Structure

```
histeq.com/
├── .github/workflows/          # CI/CD pipeline definitions
│   ├── deploy.yml             # Production deployment
│   ├── staging-deploy.yml     # Staging deployment
│   └── test.yml              # Testing and validation
├── wp-content/themes/historic-equity/  # WordPress theme
│   ├── static/               # Assets (CSS, JS, images)
│   ├── templates/           # Twig templates
│   ├── functions.php        # Theme functions
│   ├── package.json         # Node.js dependencies
│   └── webpack.config.js    # Build configuration
├── deploy-runcloud.sh        # RunCloud deployment script
└── DEPLOYMENT.md            # This guide
```

## Environment Setup

### GitHub Repository Secrets

Configure these secrets in your GitHub repository settings:

#### Optional Secrets
- `RUNCLOUD_WEBHOOK_URL` - RunCloud deployment webhook URL

### RunCloud Server Requirements

**Staging Server:**
- URL: `http://histeq.com.vbb6nz2mqj-lxd6rweqy39g.p.temp-site.link/`
- PHP 8.0+
- WordPress 6.8.2+
- Write permissions for deployment user

**Production Server:**
- Domain: `histeq.com`
- SSL certificate configured
- Automated backups enabled
- Performance optimization enabled

## Deployment Process

### Automatic Deployment (Master Branch)

1. **Code Changes**: Push changes to `master` branch
2. **Automatic Build**: GitHub Actions triggers build workflow
3. **Asset Compilation**: Webpack builds CSS and JS files
4. **Artifact Creation**: Deployment package is created and uploaded
5. **RunCloud Integration**: Webhook triggers deployment (if configured)

### Manual Deployment Process

If automatic webhook deployment is not configured:

#### 1. Download Deployment Artifact

```bash
# Go to GitHub Actions tab
# Find the latest successful workflow run
# Download the "historic-equity-deployment" artifact
# Extract the artifact to your local machine
```

#### 2. Deploy to RunCloud

Using the provided deployment script:

```bash
# Make the script executable (first time only)
chmod +x deploy-runcloud.sh

# Deploy to staging
./deploy-runcloud.sh /path/to/extracted/artifact staging

# Deploy to production (with backup)
./deploy-runcloud.sh /path/to/extracted/artifact production

# Dry run (preview changes)
./deploy-runcloud.sh --dry-run /path/to/artifact staging
```

#### 3. Manual Deployment Steps

If you prefer manual deployment:

```bash
# 1. Connect to your RunCloud server
ssh user@your-server.com

# 2. Navigate to the WordPress theme directory
cd /home/runcloud/webapps/histeq/wp-content/themes/

# 3. Backup current theme
tar -czf historic-equity-backup-$(date +%Y%m%d).tar.gz historic-equity/

# 4. Upload and extract new theme files
# (Upload artifact and extract here)

# 5. Set proper permissions
chmod -R 755 historic-equity/
find historic-equity/ -type f -exec chmod 644 {} \;

# 6. Clear any caches
# WordPress cache, server cache, etc.
```

### Staging Deployment (Pull Requests)

1. **Create Pull Request**: Open PR against `master` branch
2. **Automatic Testing**: Tests run automatically on PR creation/update
3. **Staging Build**: Staging artifact is created
4. **PR Comment**: Deployment instructions are posted as PR comment
5. **Manual Staging Deploy**: Follow PR comment instructions

## Build Process

The theme uses a modern build process with:

### Dependencies
- **Webpack 5**: Module bundling and asset optimization
- **TailwindCSS 3**: Utility-first CSS framework
- **PostCSS**: CSS processing and optimization
- **Babel**: JavaScript transpilation
- **Sass**: CSS preprocessing

### Build Commands

```bash
# Development build with watching
npm run dev

# Production build (optimized and minified)
npm run build

# Development server
npm start

# TailwindCSS development
npm run tailwind-dev

# TailwindCSS production build
npm run tailwind-build
```

### Asset Output

Built assets are generated in `static/dist/` with hash-based filenames:
- `main.[hash].js` - JavaScript bundle
- `style.[hash].css` - CSS bundle
- `assets/` - Images and other static assets

## Quality Assurance

### Automated Testing

Every deployment includes:
- ✅ Dependency validation
- ✅ Build process verification
- ✅ Asset output validation
- ✅ WordPress theme structure checks
- ✅ Security scanning
- ✅ File size optimization checks

### Manual Testing Checklist

After deployment, verify:

**Functionality:**
- [ ] Homepage loads correctly
- [ ] Navigation menu works
- [ ] Contact forms submit successfully
- [ ] Mobile responsiveness
- [ ] All images load properly

**Performance:**
- [ ] Page load time under 3 seconds
- [ ] CSS and JS files load without 404 errors
- [ ] Images are optimized and load quickly

**Cross-browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Symptom**: Webpack build fails in GitHub Actions
**Solution**:
```bash
# Check package.json dependencies
npm ci
npm run build

# Review error logs in GitHub Actions
```

#### 2. Missing Assets

**Symptom**: CSS/JS files don't load on website
**Solution**:
```bash
# Verify assets were built
ls -la wp-content/themes/historic-equity/static/dist/

# Check file permissions on server
chmod -R 755 static/
```

#### 3. Deployment Permissions

**Symptom**: Cannot write to theme directory
**Solution**:
```bash
# Fix ownership and permissions on RunCloud
chown -R runcloud:runcloud /home/runcloud/webapps/histeq/
chmod -R 755 wp-content/themes/historic-equity/
```

#### 4. Webhook Failures

**Symptom**: RunCloud webhook doesn't trigger deployment
**Solution**:
- Verify `RUNCLOUD_WEBHOOK_URL` secret is configured
- Check RunCloud webhook configuration
- Use manual deployment as fallback

### Rollback Process

If a deployment causes issues:

#### 1. Automated Rollback
```bash
# Use the deployment script with a previous artifact
./deploy-runcloud.sh /path/to/previous/artifact production
```

#### 2. Manual Rollback
```bash
# Restore from backup
cd /home/runcloud/webapps/histeq/wp-content/themes/
tar -xzf historic-equity-backup-YYYYMMDD.tar.gz
chmod -R 755 historic-equity/
```

## Monitoring

### Deployment Logs
- GitHub Actions: Repository → Actions tab
- RunCloud: Server logs and deployment history
- WordPress: Debug logs and error logs

### Performance Monitoring
- Google PageSpeed Insights
- GTmetrix
- RunCloud server metrics

## Security Considerations

### Deployment Security
- ✅ No sensitive data in repository
- ✅ Secrets managed through GitHub Secrets
- ✅ Automated security scanning in CI/CD
- ✅ File permission validation
- ✅ Backup creation before deployment

### Server Security
- SSL/TLS encryption enabled
- Regular security updates
- Access control and user permissions
- Firewall configuration
- Regular security scans

## Best Practices

### Development Workflow
1. Create feature branches from `master`
2. Make changes and test locally
3. Create pull request for review
4. Deploy to staging for testing
5. Merge to master for production deployment

### Asset Management
- Keep source files in `static/scss/` and `static/js/`
- Never commit built files to repository
- Use versioned asset filenames for cache busting
- Optimize images before committing

### Testing Strategy
- Test locally before pushing
- Use staging environment for final validation
- Perform cross-browser testing
- Test on multiple devices and screen sizes

## Support and Maintenance

### Regular Maintenance Tasks
- Update Node.js dependencies monthly
- Review and update WordPress plugins
- Monitor website performance metrics
- Review deployment logs for issues
- Test backup and restore procedures

### Emergency Procedures
1. **Site Down**: Use rollback process immediately
2. **Security Breach**: Take site offline, investigate, patch, restore
3. **Data Loss**: Restore from latest backup, verify integrity
4. **Performance Issues**: Check server resources, review recent deployments

---

## Quick Reference

### Commands
```bash
# Local development
npm run dev                    # Development build with watching
npm run build                  # Production build

# Deployment
./deploy-runcloud.sh          # Deploy current directory to staging
./deploy-runcloud.sh --help   # Show deployment options

# Testing
npm test                      # Run Playwright tests (if configured)
```

### URLs
- **Production**: https://histeq.com
- **Staging**: http://histeq.com.vbb6nz2mqj-lxd6rweqy39g.p.temp-site.link/
- **Repository**: https://github.com/ateezie/histeq.com
- **GitHub Actions**: https://github.com/ateezie/histeq.com/actions

### Support
For deployment issues, check:
1. GitHub Actions logs
2. This deployment guide
3. RunCloud server dashboard
4. WordPress debug logs