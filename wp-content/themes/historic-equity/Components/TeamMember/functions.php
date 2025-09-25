<?php
/**
 * Team Member Component Functions
 * FlyntWP component registration and utilities
 */

namespace Flynt\Components\TeamMember;

use ACF;

/**
 * Register component with FlyntWP
 */
function init() {
    // Register component styles
    add_action('wp_enqueue_scripts', __NAMESPACE__ . '\enqueue_assets');

    // Register ACF fields if ACF is active
    if (function_exists('acf_add_local_field_group')) {
        add_action('acf/init', __NAMESPACE__ . '\register_acf_fields');
    }
}

/**
 * Enqueue component assets
 */
function enqueue_assets() {
    $component_path = get_template_directory_uri() . '/Components/TeamMember/';

    // Enqueue component styles
    wp_enqueue_style(
        'team-member-component',
        $component_path . 'style.css',
        [],
        filemtime(get_template_directory() . '/Components/TeamMember/style.css')
    );

    // Enqueue component script if exists
    if (file_exists(get_template_directory() . '/Components/TeamMember/script.js')) {
        wp_enqueue_script(
            'team-member-component',
            $component_path . 'script.js',
            ['jquery'],
            filemtime(get_template_directory() . '/Components/TeamMember/script.js'),
            true
        );
    }
}

/**
 * Register ACF fields for the component
 */
function register_acf_fields() {
    acf_add_local_field_group([
        'key' => 'group_team_member_component',
        'title' => 'Team Member Component',
        'fields' => [
            [
                'key' => 'field_team_member_profile_image',
                'label' => 'Profile Image',
                'name' => 'profile_image',
                'type' => 'image',
                'instructions' => 'Upload team member profile photo. Recommended size: 300x300px or larger, square format.',
                'required' => 0,
                'return_format' => 'array',
                'preview_size' => 'medium',
                'library' => 'all',
            ],
            [
                'key' => 'field_team_member_name',
                'label' => 'Name',
                'name' => 'name',
                'type' => 'text',
                'instructions' => 'Team member full name',
                'required' => 1,
                'placeholder' => 'John Doe',
            ],
            [
                'key' => 'field_team_member_job_title',
                'label' => 'Job Title',
                'name' => 'job_title',
                'type' => 'text',
                'instructions' => 'Team member position/role',
                'required' => 1,
                'placeholder' => 'Managing Director',
            ],
            [
                'key' => 'field_team_member_description',
                'label' => 'Description',
                'name' => 'description',
                'type' => 'textarea',
                'instructions' => 'Brief description of expertise and role (2-3 sentences recommended)',
                'required' => 1,
                'rows' => 3,
                'new_lines' => 'wpautop',
                'placeholder' => 'Brief description of expertise and role...',
            ],
            [
                'key' => 'field_team_member_linkedin',
                'label' => 'LinkedIn URL',
                'name' => 'linkedin_url',
                'type' => 'url',
                'instructions' => 'LinkedIn profile URL (optional)',
                'required' => 0,
                'placeholder' => 'https://linkedin.com/in/username',
            ],
            [
                'key' => 'field_team_member_twitter',
                'label' => 'Twitter/X URL',
                'name' => 'twitter_url',
                'type' => 'url',
                'instructions' => 'Twitter/X profile URL (optional)',
                'required' => 0,
                'placeholder' => 'https://twitter.com/username',
            ],
            [
                'key' => 'field_team_member_instagram',
                'label' => 'Instagram URL',
                'name' => 'instagram_url',
                'type' => 'url',
                'instructions' => 'Instagram profile URL (optional)',
                'required' => 0,
                'placeholder' => 'https://instagram.com/username',
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'page',
                ],
            ],
        ],
        'menu_order' => 0,
        'position' => 'normal',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
    ]);
}

/**
 * Get team member initials for fallback display
 */
function get_initials($name) {
    if (empty($name)) {
        return 'TM'; // Team Member fallback
    }

    $name_parts = explode(' ', trim($name));
    $initials = '';

    if (count($name_parts) >= 1) {
        $initials .= strtoupper(substr($name_parts[0], 0, 1));
    }

    if (count($name_parts) >= 2) {
        $initials .= strtoupper(substr(end($name_parts), 0, 1));
    }

    return $initials ?: 'TM';
}

/**
 * Sanitize social media URL
 */
function sanitize_social_url($url) {
    if (empty($url)) {
        return '';
    }

    return esc_url($url);
}

/**
 * Get social media platform from URL
 */
function get_social_platform($url) {
    if (empty($url)) {
        return '';
    }

    if (strpos($url, 'linkedin.com') !== false) {
        return 'linkedin';
    } elseif (strpos($url, 'twitter.com') !== false || strpos($url, 'x.com') !== false) {
        return 'twitter';
    } elseif (strpos($url, 'instagram.com') !== false) {
        return 'instagram';
    }

    return 'external';
}

// Initialize component
add_action('init', __NAMESPACE__ . '\init');