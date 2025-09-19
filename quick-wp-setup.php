<?php
// Quick WordPress setup for viewing Historic Equity theme

// Database connection
$db_host = 'db';
$db_name = 'wordpress';
$db_user = 'wordpress';
$db_pass = 'wordpress';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create basic WordPress tables and user
    $tables = [
        "CREATE TABLE IF NOT EXISTS wp_users (
            ID bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_login varchar(60) NOT NULL DEFAULT '',
            user_pass varchar(255) NOT NULL DEFAULT '',
            user_nicename varchar(50) NOT NULL DEFAULT '',
            user_email varchar(100) NOT NULL DEFAULT '',
            user_registered datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
            user_activation_key varchar(255) NOT NULL DEFAULT '',
            user_status int(11) NOT NULL DEFAULT '0',
            display_name varchar(250) NOT NULL DEFAULT '',
            PRIMARY KEY (ID)
        )",

        "CREATE TABLE IF NOT EXISTS wp_options (
            option_id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            option_name varchar(191) NOT NULL DEFAULT '',
            option_value longtext NOT NULL,
            autoload varchar(20) NOT NULL DEFAULT 'yes',
            PRIMARY KEY (option_id),
            UNIQUE KEY option_name (option_name)
        )"
    ];

    foreach ($tables as $sql) {
        $pdo->exec($sql);
    }

    // Insert admin user
    $admin_pass = password_hash('admin123', PASSWORD_BCRYPT);
    $pdo->exec("INSERT IGNORE INTO wp_users (ID, user_login, user_pass, user_nicename, user_email, user_registered, display_name) VALUES
                (1, 'admin', '$admin_pass', 'admin', 'admin@histeq.com', NOW(), 'Admin')");

    // Insert basic options
    $options = [
        ['siteurl', 'http://localhost:8080'],
        ['home', 'http://localhost:8080'],
        ['blogname', 'Historic Equity Inc.'],
        ['blogdescription', 'State Historic Tax Credit Investment Specialists'],
        ['users_can_register', '0'],
        ['admin_email', 'admin@histeq.com'],
        ['start_of_week', '1'],
        ['use_balanceTags', '0'],
        ['use_smilies', '1'],
        ['require_name_email', '1'],
        ['comments_notify', '1'],
        ['posts_per_rss', '10'],
        ['rss_use_excerpt', '0'],
        ['mailserver_url', 'mail.example.com'],
        ['mailserver_login', 'login@example.com'],
        ['mailserver_pass', 'password'],
        ['mailserver_port', '110'],
        ['default_category', '1'],
        ['default_comment_status', 'open'],
        ['default_ping_status', 'open'],
        ['default_pingback_flag', '1'],
        ['posts_per_page', '10'],
        ['date_format', 'F j, Y'],
        ['time_format', 'g:i a'],
        ['links_updated_date_format', 'F j, Y g:i a'],
        ['comment_moderation', '0'],
        ['moderation_notify', '1'],
        ['permalink_structure', '/%year%/%monthnum%/%day%/%postname%/'],
        ['rewrite_rules', ''],
        ['hack_file', '0'],
        ['blog_charset', 'UTF-8'],
        ['moderation_keys', ''],
        ['active_plugins', 'a:1:{i:0;s:28:"timber-library/timber.php";}'],
        ['category_base', ''],
        ['ping_sites', 'http://rpc.pingomatic.com/'],
        ['comment_max_links', '2'],
        ['gmt_offset', '0'],
        ['default_email_category', '1'],
        ['recently_edited', ''],
        ['template', 'historic-equity'],
        ['stylesheet', 'historic-equity'],
        ['comment_registration', '0'],
        ['html_type', 'text/html'],
        ['use_trackback', '0'],
        ['default_role', 'subscriber'],
        ['db_version', '57155'],
        ['uploads_use_yearmonth_folders', '1'],
        ['upload_path', ''],
        ['blog_public', '1'],
        ['default_link_category', '2'],
        ['show_on_front', 'posts'],
        ['tag_base', ''],
        ['show_avatars', '1'],
        ['avatar_rating', 'G'],
        ['upload_url_path', ''],
        ['thumbnail_size_w', '150'],
        ['thumbnail_size_h', '150'],
        ['thumbnail_crop', '1'],
        ['medium_size_w', '300'],
        ['medium_size_h', '300'],
        ['avatar_default', 'mystery'],
        ['large_size_w', '1024'],
        ['large_size_h', '1024'],
        ['image_default_link_type', 'none'],
        ['image_default_size', ''],
        ['image_default_align', ''],
        ['close_comments_for_old_posts', '0'],
        ['close_comments_days_old', '14'],
        ['thread_comments', '1'],
        ['thread_comments_depth', '5'],
        ['page_comments', '0'],
        ['comments_per_page', '50'],
        ['default_comments_page', 'newest'],
        ['comment_order', 'asc'],
        ['sticky_posts', 'a:0:{}'],
        ['widget_categories', 'a:0:{}'],
        ['widget_text', 'a:0:{}'],
        ['widget_rss', 'a:0:{}'],
        ['uninstall_plugins', 'a:0:{}'],
        ['timezone_string', ''],
        ['page_for_posts', '0'],
        ['page_on_front', '0'],
        ['default_post_format', '0'],
        ['link_manager_enabled', '0'],
        ['finished_splitting_shared_terms', '1'],
        ['site_icon', '0'],
        ['medium_large_size_w', '768'],
        ['medium_large_size_h', '0'],
        ['wp_page_for_privacy_policy', '3'],
        ['show_comments_cookies_opt_in', '1'],
        ['admin_email_lifespan', '1736924400'],
        ['disallowed_keys', ''],
        ['comment_previously_approved', '1'],
        ['auto_plugin_theme_update_emails', 'a:0:{}'],
        ['auto_update_core_dev', 'enabled'],
        ['auto_update_core_minor', 'enabled'],
        ['auto_update_core_major', 'enabled']
    ];

    foreach ($options as $option) {
        $stmt = $pdo->prepare("INSERT IGNORE INTO wp_options (option_name, option_value) VALUES (?, ?)");
        $stmt->execute([$option[0], $option[1]]);
    }

    echo "WordPress setup completed successfully!\n";
    echo "Admin login: admin / admin123\n";

} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}
?>