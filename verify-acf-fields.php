<?php
/**
 * Verify ACF fields are properly registered and accessible
 * Run this from WordPress root: php -f verify-acf-fields.php
 */

// Bootstrap WordPress
require_once('./wp-load.php');

echo "=== ACF Field Group Verification ===\n";

// Check if ACF is active
if (!function_exists('acf_get_local_field_groups')) {
    echo "❌ ACF Pro is not active or installed\n";
    exit;
}

echo "✅ ACF Pro is active\n";

// Check if our field groups are registered
$field_groups = acf_get_local_field_groups();
$team_group_found = false;

foreach ($field_groups as $group) {
    if ($group['key'] === 'group_meet_our_team_content') {
        $team_group_found = true;
        echo "✅ Meet Our Team field group found: " . $group['title'] . "\n";

        // Check field count
        $fields = acf_get_local_fields($group['key']);
        echo "   Fields registered: " . count($fields) . "\n";

        // List some key fields
        foreach ($fields as $field) {
            if (in_array($field['name'], ['team_hero_title', 'team_members', 'team_cta_title'])) {
                echo "   ✅ " . $field['label'] . " (" . $field['name'] . ")\n";
            }
        }
        break;
    }
}

if (!$team_group_found) {
    echo "❌ Meet Our Team field group NOT found\n";
}

// Check if fields are accessible for page 18
echo "\n=== Page 18 Field Values ===\n";
$fields = get_fields(18);
if ($fields) {
    echo "✅ ACF fields found for page 18:\n";
    foreach ($fields as $key => $value) {
        if (strpos($key, 'team_') === 0) {
            $display_value = is_array($value) ? 'Array(' . count($value) . ')' : substr($value, 0, 50) . '...';
            echo "   {$key}: {$display_value}\n";
        }
    }
} else {
    echo "❌ No ACF fields found for page 18\n";
}

// Check page template
$template = get_page_template_slug(18);
echo "\n=== Page Template ===\n";
echo "Page 18 template: " . ($template ?: 'default') . "\n";

echo "\n=== WordPress Admin URL ===\n";
echo "Admin edit URL: " . admin_url('post.php?post=18&action=edit') . "\n";
echo "Admin user needs to login to see fields in backend\n";
?>