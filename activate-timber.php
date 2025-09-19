<?php
// Activate Timber plugin
require_once('./wp-config.php');
require_once('./wp-load.php');

if (!function_exists('activate_plugin')) {
    require_once(ABSPATH . 'wp-admin/includes/plugin.php');
}

$plugin_path = 'timber-library/timber.php';

if (!is_plugin_active($plugin_path)) {
    $result = activate_plugin($plugin_path);
    if (is_wp_error($result)) {
        echo "Error activating Timber: " . $result->get_error_message() . "\n";
    } else {
        echo "Timber plugin activated successfully!\n";
    }
} else {
    echo "Timber plugin is already active.\n";
}

// Check if Timber class exists after activation
if (class_exists('Timber\Timber')) {
    echo "Timber\\Timber class is available.\n";
} else {
    echo "Timber\\Timber class is not available.\n";
}
?>