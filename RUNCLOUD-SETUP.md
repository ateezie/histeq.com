# RunCloud CI/CD Setup Guide for Historic Equity Inc.

This guide walks you through setting up continuous deployment from GitHub to your Vultr server via RunCloud.

## Prerequisites

- RunCloud account with server connected
- GitHub repository (already configured: `git@github.com:ateezie/histeq.com.git`)
- WordPress application configured in RunCloud
- SSH access to your Vultr server

## Step 1: RunCloud Web Application Setup

1. **Login to RunCloud Dashboard**
   - Go to [runcloud.io](https://runcloud.io) and login

2. **Connect Your Repository**
   - Navigate to your web application
   - Go to `Git Repository` section
   - Enter repository URL: `git@github.com:ateezie/histeq.com.git`
   - Set branch to deploy: `main` (or your production branch)
   - Enable auto-deployment: `Yes`

3. **Configure Deployment Settings**
   - **Deployment Mode**: `Git Repository`
   - **Branch**: `main`
   - **Auto Deploy**: `Enabled`
   - **Deploy Key**: Generate and add to GitHub (see Step 2)

## Step 2: GitHub Repository Configuration

### A. Add RunCloud Deploy Key to GitHub

1. In RunCloud, copy the deploy key from `Git Repository > Deploy Key`
2. Go to GitHub repository settings
3. Navigate to `Settings > Deploy keys`
4. Click `Add deploy key`
5. Paste the key and give it a name: "RunCloud Deploy Key"
6. Enable `Allow write access` if needed

**⚠️ IMPORTANT**: Make sure to set the branch to `master` in RunCloud (not `main`)

### B. Configure GitHub Secrets (for advanced CI/CD)

If using the GitHub Actions workflow, add these secrets in your repository:

1. Go to `Settings > Secrets and variables > Actions`
2. Add the following repository secrets:

```
RUNCLOUD_API_TOKEN=your_runcloud_api_token
RUNCLOUD_SERVER_ID=your_server_id
RUNCLOUD_APP_ID=your_web_app_id
```

To get these values:
- **API Token**: RunCloud Dashboard > Profile > API Access
- **Server ID**: RunCloud Dashboard > Servers (check URL or API)
- **App ID**: RunCloud Dashboard > Web Applications (check URL or API)

## Step 3: Configure Webhook (Optional but Recommended)

### A. RunCloud Webhook Setup

1. In RunCloud web application settings
2. Go to `Git Repository > Webhook`
3. Copy the webhook URL

### B. GitHub Webhook Configuration

1. In GitHub repository settings
2. Go to `Settings > Webhooks`
3. Click `Add webhook`
4. Paste the RunCloud webhook URL
5. Content type: `application/json`
6. Events: `Just the push event`
7. Active: ✅

## Step 4: Test Deployment

### Manual Deploy Test
1. In RunCloud dashboard, go to your web application
2. Click `Git Repository > Deploy Now`
3. Monitor the deployment log for any errors

### Automated Deploy Test
1. Make a small change to your repository
2. Commit and push to the main branch:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
3. Check RunCloud dashboard for automatic deployment

## Step 5: Advanced Configuration (Optional)

### A. Environment Variables
Set environment variables in RunCloud:
- `WP_ENV=production`
- `WP_DEBUG=false`
- Any custom environment variables your application needs

### B. SSL Certificate
Ensure SSL is configured in RunCloud:
1. Go to SSL/TLS section
2. Enable Let's Encrypt or upload custom certificate

### C. Database Backup
Configure automatic database backups:
1. Go to Database section
2. Enable automatic backups
3. Set retention period

### D. Build Process
The deployment now includes automatic asset building:
- TailwindCSS compilation and minification
- JavaScript bundling and optimization
- SCSS processing
- Image optimization

### E. Enhanced Security
The `deploy.php` script now includes:
- User agent validation for webhook requests
- IP-based access restrictions (see `.htaccess-deploy-security`)
- Enhanced logging and error handling

## Step 6: Monitoring and Maintenance

### Deployment Logs
- Check deployment logs in RunCloud dashboard
- Review `deployment.log` file on server for custom deployment script logs

### Health Checks
- Monitor application uptime
- Set up notifications for deployment failures

### Performance
- Enable caching (Redis/Memcached) if needed
- Monitor server resources

## Troubleshooting

### Common Issues

1. **Deploy Key Permission Denied**
   - Ensure deploy key is properly added to GitHub
   - Check key format and permissions

2. **File Permission Issues**
   - The `deploy.php` script handles permissions automatically
   - Manually check if wp-content/uploads is writable

3. **Database Connection Issues**
   - Verify database credentials in wp-config.php
   - Check database server status

4. **Plugin/Theme Issues**
   - Ensure all required plugins are in the repository
   - Check for missing dependencies

### Support

- RunCloud Documentation: [docs.runcloud.io](https://docs.runcloud.io)
- RunCloud Support: Available in dashboard
- GitHub Actions Documentation: [docs.github.com/actions](https://docs.github.com/actions)

## Files Created

This setup creates the following files:
- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `deploy.php` - Post-deployment script
- `.runcloud/config.yml` - RunCloud configuration
- `RUNCLOUD-SETUP.md` - This setup guide

## Next Steps

After successful deployment setup:
1. Configure monitoring and alerts
2. Set up staging environment for testing
3. Implement database migration scripts if needed
4. Configure backup procedures
5. Document the deployment process for your team

## Security Considerations

- Keep API tokens and secrets secure
- Regularly rotate deploy keys
- Monitor deployment logs for suspicious activity
- Ensure proper file permissions on the server
- Keep WordPress and plugins updated