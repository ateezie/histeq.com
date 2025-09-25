<?php
/**
 * RunCloud Deployment Script for Historic Equity Inc.
 * This script handles post-deployment tasks after code is pulled from GitHub
 */

// Enhanced security checks
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die('Method Not Allowed');
}

// Additional security: Check if accessed via command line or specific user agent
$allowed_user_agents = ['RunCloud-Webhook', 'GitHub-Hookshot'];
$is_cli = php_sapi_name() === 'cli';
$valid_user_agent = false;

if (isset($_SERVER['HTTP_USER_AGENT'])) {
    foreach ($allowed_user_agents as $agent) {
        if (strpos($_SERVER['HTTP_USER_AGENT'], $agent) !== false) {
            $valid_user_agent = true;
            break;
        }
    }
}

if (!$is_cli && !$valid_user_agent) {
    http_response_code(403);
    die('Access forbidden');
}

// Verify the request is from GitHub (optional webhook secret verification)
$webhook_secret = getenv('GITHUB_WEBHOOK_SECRET');
if ($webhook_secret && isset($_SERVER['HTTP_X_HUB_SIGNATURE_256'])) {
    $payload = file_get_contents('php://input');
    $signature = hash_hmac('sha256', $payload, $webhook_secret);
    $expected_signature = 'sha256=' . $signature;

    if (!hash_equals($expected_signature, $_SERVER['HTTP_X_HUB_SIGNATURE_256'])) {
        http_response_code(403);
        die('Invalid signature');
    }
}

// Log deployment
$log_file = __DIR__ . '/deployment.log';
$timestamp = date('Y-m-d H:i:s');

function log_message($message) {
    global $log_file, $timestamp;
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND | LOCK_EX);
}

log_message("Deployment started");

try {
    // Change to the web application directory
    $app_root = __DIR__;
    chdir($app_root);

    // Clear WordPress cache if using caching plugins
    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
        log_message("WordPress cache cleared");
    }

    // Clear any opcache
    if (function_exists('opcache_reset')) {
        opcache_reset();
        log_message("OpCache cleared");
    }

    // Clear expired transients
    if (function_exists('delete_expired_transients')) {
        delete_expired_transients(true);
        log_message("Expired transients cleared");
    }

    // Flush rewrite rules for custom post types and permalinks
    if (function_exists('flush_rewrite_rules')) {
        flush_rewrite_rules(true);
        log_message("WordPress rewrite rules flushed");
    }

    // Clear Redis cache if available
    if (class_exists('Redis')) {
        try {
            $redis = new Redis();
            if ($redis->connect('127.0.0.1', 6379)) {
                $redis->flushDB();
                log_message("Redis cache cleared");
            }
        } catch (Exception $e) {
            log_message("Redis cache clear failed: " . $e->getMessage());
        }
    }

    // Update file permissions for WordPress
    exec('find . -type f -exec chmod 644 {} \;', $output, $return_code);
    if ($return_code === 0) {
        log_message("File permissions updated");
    }

    exec('find . -type d -exec chmod 755 {} \;', $output, $return_code);
    if ($return_code === 0) {
        log_message("Directory permissions updated");
    }

    // Make sure wp-config.php is not writable
    if (file_exists('wp-config.php')) {
        chmod('wp-config.php', 0644);
        log_message("wp-config.php permissions secured");
    }

    // Ensure uploads directory is writable
    $uploads_dir = 'wp-content/uploads';
    if (is_dir($uploads_dir)) {
        chmod($uploads_dir, 0755);
        exec("find $uploads_dir -type d -exec chmod 755 {} \;");
        exec("find $uploads_dir -type f -exec chmod 644 {} \;");
        log_message("Uploads directory permissions updated");
    }

    // WordPress-specific file permissions
    exec('find wp-content/themes -type f -exec chmod 644 {} \; 2>/dev/null', $output, $return_code);
    if ($return_code === 0) {
        log_message("Theme file permissions updated");
    }

    exec('find wp-content/plugins -type f -exec chmod 644 {} \; 2>/dev/null', $output, $return_code);
    if ($return_code === 0) {
        log_message("Plugin file permissions updated");
    }

    // Ensure uploads directory is properly configured
    if (is_dir('wp-content/uploads')) {
        exec('find wp-content/uploads -type d -exec chmod 755 {} \; 2>/dev/null');
        exec('find wp-content/uploads -type f -exec chmod 644 {} \; 2>/dev/null');
        log_message("Uploads directory permissions updated");
    }

    // Update WordPress database if WP-CLI is available
    exec('which wp 2>/dev/null', $output, $return_code);
    if ($return_code === 0) {
        exec('wp core update-db --quiet 2>/dev/null', $output, $return_code);
        if ($return_code === 0) {
            log_message("WordPress database updated via WP-CLI");
        }
    }

    log_message("Deployment completed successfully");

    // Success response
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Deployment completed successfully',
        'timestamp' => $timestamp
    ]);

} catch (Exception $e) {
    log_message("Deployment failed: " . $e->getMessage());

    // Error response
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Deployment failed: ' . $e->getMessage(),
        'timestamp' => $timestamp
    ]);
}
?>