<?php
/**
 * WordPress Setup Script for Historic Equity
 * Automates the initial WordPress setup with custom admin user
 */

define('WP_USE_THEMES', false);
require_once('/var/www/html/wp-load.php');
require_once('/var/www/html/wp-admin/includes/upgrade.php');

// Check if WordPress is already installed
if (is_blog_installed()) {
    echo "WordPress is already installed!\n";
    exit;
}

// Install WordPress
$result = wp_install(
    'Historic Equity Inc.', // Blog title
    'historic__admin', // Admin username
    'hello@histeq.com', // Admin email
    true, // Public
    '', // Deprecated
    'GM^oj4K1By' // Admin password
);

if (is_wp_error($result)) {
    echo "Installation failed: " . $result->get_error_message() . "\n";
    exit(1);
}

echo "WordPress installed successfully!\n";
echo "Admin user: historic__admin\n";
echo "Admin password: GM^oj4K1By\n";
echo "Site URL: http://localhost:8080\n";
echo "Admin URL: http://localhost:8080/wp-admin\n";
?>