<?php
/**
 * RunCloud Deployment Script for Historic Equity Inc.
 * This script handles post-deployment tasks after code is pulled from GitHub
 */

// Security check - only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die('Method Not Allowed');
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

    // Update WordPress database if needed (uncomment if you have migrations)
    // exec('wp core update-db --quiet', $output, $return_code);
    // if ($return_code === 0) {
    //     log_message("WordPress database updated");
    // }

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