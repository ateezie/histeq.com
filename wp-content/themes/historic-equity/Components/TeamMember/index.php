<?php
/**
 * Historic Equity Team Member Component
 * FlyntWP compatible component for team member display
 */

namespace Flynt\Components\TeamMember;

use Timber\Timber;

/**
 * Register component scripts and styles
 */
function init() {
    // Component doesn't require JavaScript functionality
    // Styles are handled via component SCSS
}

/**
 * Get component data for rendering
 */
function getACFLayout() {
    return [
        'name' => 'teamMember',
        'label' => 'Team Member',
        'display' => 'block',
        'sub_fields' => getFields()
    ];
}

/**
 * Get component fields for ACF
 */
function getFields() {
    return [
        [
            'label' => 'Team Member',
            'name' => 'teamMember',
            'type' => 'group',
            'sub_fields' => [
                [
                    'label' => 'Profile Image',
                    'name' => 'profileImage',
                    'type' => 'image',
                    'return_format' => 'array',
                    'preview_size' => 'medium',
                    'library' => 'all',
                    'instructions' => 'Upload team member profile photo (recommended: square format, min 300x300px)'
                ],
                [
                    'label' => 'Name',
                    'name' => 'name',
                    'type' => 'text',
                    'required' => true,
                    'placeholder' => 'John Doe'
                ],
                [
                    'label' => 'Job Title',
                    'name' => 'jobTitle',
                    'type' => 'text',
                    'required' => true,
                    'placeholder' => 'Managing Director'
                ],
                [
                    'label' => 'Description',
                    'name' => 'description',
                    'type' => 'textarea',
                    'required' => true,
                    'rows' => 3,
                    'new_lines' => 'wpautop',
                    'placeholder' => 'Brief description of expertise and role...'
                ],
                [
                    'label' => 'Social Media Links',
                    'name' => 'socialLinks',
                    'type' => 'group',
                    'sub_fields' => [
                        [
                            'label' => 'LinkedIn URL',
                            'name' => 'linkedin',
                            'type' => 'url',
                            'placeholder' => 'https://linkedin.com/in/username'
                        ],
                        [
                            'label' => 'Twitter/X URL',
                            'name' => 'twitter',
                            'type' => 'url',
                            'placeholder' => 'https://twitter.com/username'
                        ],
                        [
                            'label' => 'Instagram URL',
                            'name' => 'instagram',
                            'type' => 'url',
                            'placeholder' => 'https://instagram.com/username'
                        ]
                    ]
                ]
            ]
        ]
    ];
}

/**
 * Component render function
 */
function render($context = []) {
    // Validate required data
    if (empty($context['teamMember'])) {
        return '';
    }

    $data = $context['teamMember'];

    // Prepare team member data
    $teamMemberData = [
        'name' => $data['name'] ?? '',
        'jobTitle' => $data['jobTitle'] ?? '',
        'description' => $data['description'] ?? '',
        'profileImage' => $data['profileImage'] ?? null,
        'socialLinks' => $data['socialLinks'] ?? []
    ];

    // Generate initials for fallback
    if (!empty($teamMemberData['name'])) {
        $nameParts = explode(' ', trim($teamMemberData['name']));
        $initials = '';
        if (count($nameParts) >= 1) {
            $initials .= strtoupper(substr($nameParts[0], 0, 1));
        }
        if (count($nameParts) >= 2) {
            $initials .= strtoupper(substr(end($nameParts), 0, 1));
        }
        $teamMemberData['initials'] = $initials;
    }

    // Add component context
    $context['teamMemberData'] = $teamMemberData;
    $context['componentName'] = 'TeamMember';

    return \Timber\Timber::render('TeamMember.twig', $context);
}

// Initialize component
add_action('init', __NAMESPACE__ . '\init');