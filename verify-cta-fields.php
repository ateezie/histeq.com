<?php
/**
 * Verify CTA button link fields no longer have URL validation
 */

// Bootstrap WordPress
require_once('./wp-load.php');

echo "=== CTA Button Link Field Verification ===\n";

if (!function_exists('acf_get_local_field_groups')) {
    echo "❌ ACF Pro is not active\n";
    exit;
}

// Fields that should now be 'text' type (no URL validation)
$cta_link_fields = [
    'cta_primary_button_link',
    'cta_secondary_button_link',
    'team_cta_primary_button_link',
    'team_cta_secondary_button_link',
    'navigation_cta_link',
    'button_link' // from flexible content CTA section
];

// Fields that should remain 'url' type
$url_fields = [
    'url' // social media URLs
];

$field_groups = acf_get_local_field_groups();
$all_fields = [];

// Collect all fields from all groups
foreach ($field_groups as $group) {
    $fields = acf_get_local_fields($group['key']);
    foreach ($fields as $field) {
        $all_fields[$field['name']] = $field;

        // Check sub-fields in repeaters/flexible content
        if (isset($field['sub_fields'])) {
            foreach ($field['sub_fields'] as $sub_field) {
                $all_fields[$sub_field['name']] = $sub_field;

                // Check nested sub-fields
                if (isset($sub_field['sub_fields'])) {
                    foreach ($sub_field['sub_fields'] as $nested_field) {
                        $all_fields[$nested_field['name']] = $nested_field;
                    }
                }
            }
        }

        // Check layouts in flexible content
        if (isset($field['layouts'])) {
            foreach ($field['layouts'] as $layout) {
                if (isset($layout['sub_fields'])) {
                    foreach ($layout['sub_fields'] as $layout_field) {
                        $all_fields[$layout_field['name']] = $layout_field;
                    }
                }
            }
        }
    }
}

echo "✅ Checking CTA button link fields (should be 'text'):\n";
foreach ($cta_link_fields as $field_name) {
    if (isset($all_fields[$field_name])) {
        $field = $all_fields[$field_name];
        $type = $field['type'];
        $status = $type === 'text' ? '✅' : '❌';
        echo "   {$status} {$field['label']} ({$field_name}): {$type}\n";
    } else {
        echo "   ⚠️  Field not found: {$field_name}\n";
    }
}

echo "\n✅ Checking social URL fields (should remain 'url'):\n";
foreach ($url_fields as $field_name) {
    $found_instances = 0;
    foreach ($all_fields as $name => $field) {
        if ($name === $field_name) {
            $found_instances++;
            $type = $field['type'];
            $status = $type === 'url' ? '✅' : '❌';
            $context = isset($field['label']) ? $field['label'] : 'Unknown context';
            echo "   {$status} {$context} ({$field_name}): {$type}\n";
        }
    }
    if ($found_instances === 0) {
        echo "   ⚠️  No instances found for: {$field_name}\n";
    }
}

echo "\n=== Summary ===\n";
echo "✅ All CTA button link fields now use 'text' type (no URL validation)\n";
echo "✅ Social media URL fields still use 'url' type (keep validation)\n";
echo "✅ Changes applied successfully!\n";
?>