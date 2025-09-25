<?php
/**
 * ACF Pro Field Groups for Historic Equity Theme
 *
 * Programmatically creates all ACF field groups for content management
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register ACF Field Groups
 */
function historic_equity_register_acf_field_groups() {

    // Check if ACF Pro is active
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    // T010-T016: Homepage Content Fields
    acf_add_local_field_group(array(
        'key' => 'group_homepage_content',
        'title' => 'Homepage Content',
        'fields' => array(
            // Hero Section
            array(
                'key' => 'field_hero_title',
                'label' => 'Hero Title',
                'name' => 'hero_title',
                'type' => 'textarea',
                'instructions' => 'Main headline for the homepage hero section',
                'required' => 1,
                'default_value' => 'Preserving History,\nEmpowering\nCommunities\nThrough Equity\nInvestment',
                'rows' => 5,
            ),
            array(
                'key' => 'field_hero_subtitle',
                'label' => 'Hero Subtitle',
                'name' => 'hero_subtitle',
                'type' => 'textarea',
                'instructions' => 'Supporting text below the hero title',
                'rows' => 3,
            ),
            array(
                'key' => 'field_hero_image',
                'label' => 'Hero Image',
                'name' => 'hero_image',
                'type' => 'image',
                'instructions' => 'Main image for the hero section',
                'return_format' => 'array',
                'preview_size' => 'medium',
                'library' => 'all',
            ),

            // Mission Section
            array(
                'key' => 'field_mission_title',
                'label' => 'Mission Title',
                'name' => 'mission_title',
                'type' => 'text',
                'instructions' => 'Title for the mission section',
                'default_value' => 'Our historic mission',
            ),
            array(
                'key' => 'field_mission_content',
                'label' => 'Mission Content',
                'name' => 'mission_content',
                'type' => 'textarea',
                'instructions' => 'Mission statement content',
                'rows' => 4,
                'default_value' => 'Since 2001, Historic Equity Inc. has been dedicated to preserving America\'s architectural heritage while empowering communities through strategic investment partnerships.',
            ),

            // Services Section
            array(
                'key' => 'field_services_title',
                'label' => 'Services Title',
                'name' => 'services_title',
                'type' => 'text',
                'instructions' => 'Title for the services section',
                'default_value' => 'How we preserve history',
            ),
            array(
                'key' => 'field_service_items',
                'label' => 'Service Items',
                'name' => 'service_items',
                'type' => 'repeater',
                'instructions' => 'Add service items with title, content, and image',
                'layout' => 'block',
                'button_label' => 'Add Service Item',
                'sub_fields' => array(
                    array(
                        'key' => 'field_service_title',
                        'label' => 'Service Title',
                        'name' => 'title',
                        'type' => 'text',
                        'required' => 1,
                    ),
                    array(
                        'key' => 'field_service_content',
                        'label' => 'Service Content',
                        'name' => 'content',
                        'type' => 'textarea',
                        'rows' => 3,
                    ),
                    array(
                        'key' => 'field_service_image',
                        'label' => 'Service Image',
                        'name' => 'image',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'medium',
                    ),
                ),
            ),

            // Success Stories Section
            array(
                'key' => 'field_stats_title',
                'label' => 'Success Stories Title',
                'name' => 'stats_title',
                'type' => 'text',
                'instructions' => 'Title for the success stories section',
                'default_value' => 'Our successful preservation stories',
            ),
            array(
                'key' => 'field_stats_subtitle',
                'label' => 'Success Stories Subtitle',
                'name' => 'stats_subtitle',
                'type' => 'text',
                'instructions' => 'Subtitle for the success stories section',
                'default_value' => 'Across 17+ states, we\'ve helped preserve over 200 historic properties',
            ),
            array(
                'key' => 'field_stats_items',
                'label' => 'Statistics Items',
                'name' => 'stats_items',
                'type' => 'repeater',
                'instructions' => 'Add statistics with number and label',
                'layout' => 'table',
                'button_label' => 'Add Statistic',
                'sub_fields' => array(
                    array(
                        'key' => 'field_stat_number',
                        'label' => 'Number',
                        'name' => 'number',
                        'type' => 'text',
                        'required' => 1,
                        'placeholder' => '24+',
                    ),
                    array(
                        'key' => 'field_stat_label',
                        'label' => 'Label',
                        'name' => 'label',
                        'type' => 'text',
                        'required' => 1,
                        'placeholder' => 'Years Experience',
                    ),
                ),
            ),

            // Why Partner Section
            array(
                'key' => 'field_partner_title',
                'label' => 'Why Partner Title',
                'name' => 'partner_title',
                'type' => 'text',
                'instructions' => 'Title for the why partner section',
                'default_value' => 'Why partner with Historic Equity Inc?',
            ),
            array(
                'key' => 'field_partner_items',
                'label' => 'Partner Benefits',
                'name' => 'partner_items',
                'type' => 'repeater',
                'instructions' => 'Add partner benefit items',
                'layout' => 'block',
                'button_label' => 'Add Benefit',
                'sub_fields' => array(
                    array(
                        'key' => 'field_benefit_title',
                        'label' => 'Benefit Title',
                        'name' => 'title',
                        'type' => 'text',
                        'required' => 1,
                    ),
                    array(
                        'key' => 'field_benefit_description',
                        'label' => 'Benefit Description',
                        'name' => 'description',
                        'type' => 'textarea',
                        'rows' => 2,
                    ),
                    array(
                        'key' => 'field_benefit_icon',
                        'label' => 'Benefit Icon',
                        'name' => 'icon',
                        'type' => 'select',
                        'choices' => array(
                            'check' => 'Check Circle',
                            'users' => 'Users',
                            'lightning' => 'Lightning',
                            'shield' => 'Shield',
                            'star' => 'Star',
                        ),
                        'default_value' => 'check',
                    ),
                ),
            ),

            // CTA Section
            array(
                'key' => 'field_cta_title',
                'label' => 'CTA Title',
                'name' => 'cta_title',
                'type' => 'text',
                'instructions' => 'Title for the call-to-action section',
                'default_value' => 'Join our preservation mission',
            ),
            array(
                'key' => 'field_cta_content',
                'label' => 'CTA Content',
                'name' => 'cta_content',
                'type' => 'textarea',
                'instructions' => 'Content for the call-to-action section',
                'rows' => 3,
                'default_value' => 'Help us protect architectural heritage and create meaningful community impact.',
            ),
            array(
                'key' => 'field_cta_image',
                'label' => 'CTA Image',
                'name' => 'cta_image',
                'type' => 'image',
                'instructions' => 'Large image for the CTA section',
                'return_format' => 'array',
                'preview_size' => 'medium',
            ),
            array(
                'key' => 'field_cta_primary_button_text',
                'label' => 'CTA Primary Button Text',
                'name' => 'cta_primary_button_text',
                'type' => 'text',
                'instructions' => 'Text for the primary CTA button',
                'default_value' => 'Donate',
            ),
            array(
                'key' => 'field_cta_primary_button_link',
                'label' => 'CTA Primary Button Link',
                'name' => 'cta_primary_button_link',
                'type' => 'text',
                'instructions' => 'URL for the primary CTA button',
                'default_value' => '/donate',
            ),
            array(
                'key' => 'field_cta_secondary_button_text',
                'label' => 'CTA Secondary Button Text',
                'name' => 'cta_secondary_button_text',
                'type' => 'text',
                'instructions' => 'Text for the secondary CTA button',
                'default_value' => 'Get involved',
            ),
            array(
                'key' => 'field_cta_secondary_button_link',
                'label' => 'CTA Secondary Button Link',
                'name' => 'cta_secondary_button_link',
                'type' => 'text',
                'instructions' => 'URL for the secondary CTA button',
                'default_value' => '/get-involved',
            ),

            // Building Carousel Section
            array(
                'key' => 'field_carousel_title',
                'label' => 'Carousel Title',
                'name' => 'carousel_title',
                'type' => 'text',
                'instructions' => 'Title for the building images carousel',
                'default_value' => 'Historic Properties We\'ve Preserved',
            ),
            array(
                'key' => 'field_carousel_subtitle',
                'label' => 'Carousel Subtitle',
                'name' => 'carousel_subtitle',
                'type' => 'text',
                'instructions' => 'Subtitle for the building images carousel',
                'default_value' => 'Transforming communities through historic preservation',
            ),
            array(
                'key' => 'field_building_images',
                'label' => 'Building Images',
                'name' => 'building_images',
                'type' => 'repeater',
                'instructions' => 'Add building images for the carousel',
                'layout' => 'block',
                'button_label' => 'Add Building',
                'sub_fields' => array(
                    array(
                        'key' => 'field_building_image',
                        'label' => 'Building Image',
                        'name' => 'image',
                        'type' => 'image',
                        'required' => 1,
                        'return_format' => 'array',
                        'preview_size' => 'medium',
                        'library' => 'all',
                    ),
                    array(
                        'key' => 'field_building_title',
                        'label' => 'Building Title',
                        'name' => 'title',
                        'type' => 'text',
                        'required' => 1,
                        'placeholder' => 'Union Station',
                    ),
                    array(
                        'key' => 'field_building_location',
                        'label' => 'Building Location',
                        'name' => 'location',
                        'type' => 'text',
                        'required' => 1,
                        'placeholder' => 'St. Louis, MO',
                    ),
                    array(
                        'key' => 'field_building_year',
                        'label' => 'Year Built/Renovated',
                        'name' => 'year',
                        'type' => 'text',
                        'placeholder' => '1894/2023',
                    ),
                    array(
                        'key' => 'field_building_description',
                        'label' => 'Building Description',
                        'name' => 'description',
                        'type' => 'textarea',
                        'rows' => 2,
                        'placeholder' => 'Historic train station transformed into modern mixed-use development',
                    ),
                ),
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'page_type',
                    'operator' => '==',
                    'value' => 'front_page',
                ),
            ),
            array(
                array(
                    'param' => 'page',
                    'operator' => '==',
                    'value' => get_option('page_on_front'),
                ),
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'page',
                ),
            ),
        ),
        'menu_order' => 0,
        'position' => 'normal',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
    ));

    // T017-T021: Meet Our Team Content Fields
    acf_add_local_field_group(array(
        'key' => 'group_meet_our_team_content',
        'title' => 'Meet Our Team Content',
        'fields' => array(
            // Hero Section
            array(
                'key' => 'field_team_hero_title',
                'label' => 'Team Hero Title',
                'name' => 'team_hero_title',
                'type' => 'text',
                'instructions' => 'Main title for the team page',
                'default_value' => 'Meet our experts',
            ),
            array(
                'key' => 'field_team_hero_content',
                'label' => 'Team Hero Content',
                'name' => 'team_hero_content',
                'type' => 'textarea',
                'instructions' => 'Supporting content for the team hero section',
                'rows' => 3,
                'default_value' => 'Dedicated professionals transforming historic rehabilitation projects through strategic tax credit investments',
            ),

            // Team Section
            array(
                'key' => 'field_team_section_category',
                'label' => 'Team Section Category',
                'name' => 'team_section_category',
                'type' => 'text',
                'instructions' => 'Small category text above the team section title',
                'default_value' => 'Innovators',
            ),
            array(
                'key' => 'field_team_section_title',
                'label' => 'Team Section Title',
                'name' => 'team_section_title',
                'type' => 'text',
                'instructions' => 'Title for the team members section',
                'default_value' => 'Our team',
            ),
            array(
                'key' => 'field_team_section_subtitle',
                'label' => 'Team Section Subtitle',
                'name' => 'team_section_subtitle',
                'type' => 'text',
                'instructions' => 'Subtitle for the team members section',
                'default_value' => 'Experienced professionals driving value in historic property investments',
            ),

            // Team Members
            array(
                'key' => 'field_team_members',
                'label' => 'Team Members',
                'name' => 'team_members',
                'type' => 'repeater',
                'instructions' => 'Add team member information',
                'layout' => 'block',
                'button_label' => 'Add Team Member',
                'sub_fields' => array(
                    array(
                        'key' => 'field_member_name',
                        'label' => 'Name',
                        'name' => 'name',
                        'type' => 'text',
                        'required' => 1,
                    ),
                    array(
                        'key' => 'field_member_title',
                        'label' => 'Job Title',
                        'name' => 'title',
                        'type' => 'text',
                        'required' => 1,
                    ),
                    array(
                        'key' => 'field_member_bio',
                        'label' => 'Bio',
                        'name' => 'bio',
                        'type' => 'textarea',
                        'rows' => 3,
                    ),
                    array(
                        'key' => 'field_member_photo',
                        'label' => 'Photo',
                        'name' => 'photo',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'thumbnail',
                    ),
                    array(
                        'key' => 'field_member_social_links',
                        'label' => 'Social Links',
                        'name' => 'social_links',
                        'type' => 'repeater',
                        'layout' => 'table',
                        'button_label' => 'Add Social Link',
                        'sub_fields' => array(
                            array(
                                'key' => 'field_social_platform',
                                'label' => 'Platform',
                                'name' => 'platform',
                                'type' => 'select',
                                'choices' => array(
                                    'linkedin' => 'LinkedIn',
                                    'twitter' => 'Twitter',
                                    'email' => 'Email',
                                ),
                            ),
                            array(
                                'key' => 'field_social_url',
                                'label' => 'URL',
                                'name' => 'url',
                                'type' => 'url',
                            ),
                        ),
                    ),
                ),
            ),

            // Team CTA Section
            array(
                'key' => 'field_team_cta_title',
                'label' => 'Team CTA Title',
                'name' => 'team_cta_title',
                'type' => 'text',
                'instructions' => 'Title for the team CTA section',
                'default_value' => 'Ready to explore historic investments',
            ),
            array(
                'key' => 'field_team_cta_content',
                'label' => 'Team CTA Content',
                'name' => 'team_cta_content',
                'type' => 'textarea',
                'instructions' => 'Content for the team CTA section',
                'rows' => 3,
                'default_value' => 'Connect with our team to unlock the potential of historic tax credit investments',
            ),
            array(
                'key' => 'field_team_cta_primary_button_text',
                'label' => 'Team CTA Primary Button Text',
                'name' => 'team_cta_primary_button_text',
                'type' => 'text',
                'instructions' => 'Text for the primary CTA button',
                'default_value' => 'Contact Our Team',
            ),
            array(
                'key' => 'field_team_cta_primary_button_link',
                'label' => 'Team CTA Primary Button Link',
                'name' => 'team_cta_primary_button_link',
                'type' => 'text',
                'instructions' => 'URL for the primary CTA button',
                'default_value' => '/contact',
            ),
            array(
                'key' => 'field_team_cta_secondary_button_text',
                'label' => 'Team CTA Secondary Button Text',
                'name' => 'team_cta_secondary_button_text',
                'type' => 'text',
                'instructions' => 'Text for the secondary CTA button',
                'default_value' => 'View Projects',
            ),
            array(
                'key' => 'field_team_cta_secondary_button_link',
                'label' => 'Team CTA Secondary Button Link',
                'name' => 'team_cta_secondary_button_link',
                'type' => 'text',
                'instructions' => 'URL for the secondary CTA button',
                'default_value' => '/projects',
            ),
            array(
                'key' => 'field_team_cta_image',
                'label' => 'Team CTA Image',
                'name' => 'team_cta_image',
                'type' => 'image',
                'instructions' => 'Image for the team CTA section',
                'return_format' => 'array',
                'preview_size' => 'medium',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'page_template',
                    'operator' => '==',
                    'value' => 'page-meet-our-team.php',
                ),
            ),
            array(
                array(
                    'param' => 'page',
                    'operator' => '==',
                    'value' => '18',
                ),
            ),
        ),
        'menu_order' => 0,
        'position' => 'normal',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
    ));

    // T022-T025: Contact Page Content Fields
    acf_add_local_field_group(array(
        'key' => 'group_contact_page_content',
        'title' => 'Contact Page Content',
        'fields' => array(
            // Hero Section
            array(
                'key' => 'field_contact_hero_title',
                'label' => 'Contact Hero Title',
                'name' => 'contact_hero_title',
                'type' => 'text',
                'instructions' => 'Main title for the contact page',
                'default_value' => 'Connect with us',
            ),
            array(
                'key' => 'field_contact_hero_content',
                'label' => 'Contact Hero Content',
                'name' => 'contact_hero_content',
                'type' => 'textarea',
                'instructions' => 'Supporting content for the contact hero section',
                'rows' => 3,
                'default_value' => 'Reach out to Historic Equity Inc for expert guidance on historic rehabilitation tax credit investments',
            ),

            // Contact Information
            array(
                'key' => 'field_contact_title',
                'label' => 'Contact Section Title',
                'name' => 'contact_title',
                'type' => 'text',
                'instructions' => 'Title for the contact information section',
                'default_value' => 'Contact us',
            ),
            array(
                'key' => 'field_contact_email',
                'label' => 'Email Address',
                'name' => 'email',
                'type' => 'email',
                'instructions' => 'Primary contact email',
                'default_value' => 'info@historicequity.com',
            ),
            array(
                'key' => 'field_contact_phone',
                'label' => 'Phone Number',
                'name' => 'phone',
                'type' => 'text',
                'instructions' => 'Primary contact phone number',
                'default_value' => '(314) 555-0199',
            ),
            array(
                'key' => 'field_office_address',
                'label' => 'Office Address',
                'name' => 'office_address',
                'type' => 'textarea',
                'instructions' => 'Office address for contact',
                'rows' => 2,
                'default_value' => '100 N Street NW, Washington DC 20005',
            ),

            // Form Section
            array(
                'key' => 'field_form_title',
                'label' => 'Form Section Title',
                'name' => 'form_title',
                'type' => 'text',
                'instructions' => 'Title for the contact form section',
                'default_value' => 'Send us a message',
            ),
            array(
                'key' => 'field_form_description',
                'label' => 'Form Description',
                'name' => 'form_description',
                'type' => 'textarea',
                'instructions' => 'Description text above the contact form',
                'rows' => 2,
                'default_value' => 'Share your project details and we\'ll respond promptly',
            ),
            array(
                'key' => 'field_contact_description',
                'label' => 'Contact Description',
                'name' => 'contact_description',
                'type' => 'textarea',
                'instructions' => 'Description text for contact information section',
                'rows' => 2,
                'default_value' => 'We\'re here to help you maximize the potential of your historic rehabilitation project',
            ),
            array(
                'key' => 'field_gravity_form_id',
                'label' => 'Gravity Form ID',
                'name' => 'gravity_form_id',
                'type' => 'number',
                'instructions' => 'Enter the Gravity Form ID to display (leave empty to use default form ID 1)',
                'min' => 1,
                'step' => 1,
                'default_value' => 1,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'page_template',
                    'operator' => '==',
                    'value' => 'page-contact.php',
                ),
            ),
        ),
        'menu_order' => 0,
        'position' => 'normal',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
    ));

    // T026-T030: Global Content Fields
    acf_add_local_field_group(array(
        'key' => 'group_global_content',
        'title' => 'Global Content',
        'fields' => array(
            // Header Fields
            array(
                'key' => 'field_site_logo',
                'label' => 'Site Logo',
                'name' => 'site_logo',
                'type' => 'image',
                'instructions' => 'Main site logo for header',
                'return_format' => 'array',
                'preview_size' => 'thumbnail',
            ),
            array(
                'key' => 'field_navigation_cta_text',
                'label' => 'Navigation CTA Text',
                'name' => 'navigation_cta_text',
                'type' => 'text',
                'instructions' => 'Text for the header CTA button',
                'default_value' => 'Contact',
            ),
            array(
                'key' => 'field_navigation_cta_link',
                'label' => 'Navigation CTA Link',
                'name' => 'navigation_cta_link',
                'type' => 'text',
                'instructions' => 'URL for the header CTA button',
                'default_value' => '/contact/',
            ),

            // Footer Fields
            array(
                'key' => 'field_footer_logo',
                'label' => 'Footer Logo',
                'name' => 'footer_logo',
                'type' => 'image',
                'instructions' => 'Logo for footer (can be different from header)',
                'return_format' => 'array',
                'preview_size' => 'thumbnail',
            ),
            array(
                'key' => 'field_footer_tagline',
                'label' => 'Footer Tagline',
                'name' => 'footer_tagline',
                'type' => 'text',
                'instructions' => 'Tagline text for footer',
                'default_value' => 'Historic Equity Inc.',
            ),
            array(
                'key' => 'field_footer_contact_info',
                'label' => 'Footer Contact Info',
                'name' => 'footer_contact_info',
                'type' => 'textarea',
                'instructions' => 'Contact information for footer',
                'rows' => 4,
                'default_value' => "123 Historic Lane\nPreservation City, PC 12345\n1-800-HISTORIC\ninfo@historicequity.org",
            ),
            array(
                'key' => 'field_footer_social_links',
                'label' => 'Footer Social Links',
                'name' => 'footer_social_links',
                'type' => 'repeater',
                'instructions' => 'Social media links for footer',
                'layout' => 'table',
                'button_label' => 'Add Social Link',
                'sub_fields' => array(
                    array(
                        'key' => 'field_footer_social_platform',
                        'label' => 'Platform',
                        'name' => 'platform',
                        'type' => 'select',
                        'choices' => array(
                            'facebook' => 'Facebook',
                            'instagram' => 'Instagram',
                            'twitter' => 'Twitter/X',
                            'linkedin' => 'LinkedIn',
                            'youtube' => 'YouTube',
                        ),
                    ),
                    array(
                        'key' => 'field_footer_social_url',
                        'label' => 'URL',
                        'name' => 'url',
                        'type' => 'url',
                    ),
                ),
            ),

            // Brand Colors
            array(
                'key' => 'field_primary_orange',
                'label' => 'Primary Orange',
                'name' => 'primary_orange',
                'type' => 'color_picker',
                'instructions' => 'Primary brand orange color',
                'default_value' => '#BD572B',
            ),
            array(
                'key' => 'field_primary_gold',
                'label' => 'Primary Gold',
                'name' => 'primary_gold',
                'type' => 'color_picker',
                'instructions' => 'Primary brand gold color',
                'default_value' => '#E6CD41',
            ),
            array(
                'key' => 'field_primary_brown',
                'label' => 'Primary Brown',
                'name' => 'primary_brown',
                'type' => 'color_picker',
                'instructions' => 'Primary brand brown color',
                'default_value' => '#95816E',
            ),
            array(
                'key' => 'field_light_blue',
                'label' => 'Light Blue',
                'name' => 'light_blue',
                'type' => 'color_picker',
                'instructions' => 'Accent light blue color',
                'default_value' => '#83ACD1',
            ),
            array(
                'key' => 'field_navy',
                'label' => 'Navy',
                'name' => 'navy',
                'type' => 'color_picker',
                'instructions' => 'Dark navy color',
                'default_value' => '#2D2E3D',
            ),

            // Company Info
            array(
                'key' => 'field_company_name',
                'label' => 'Company Name',
                'name' => 'company_name',
                'type' => 'text',
                'instructions' => 'Full company name',
                'default_value' => 'Historic Equity Inc.',
            ),
            array(
                'key' => 'field_founded_year',
                'label' => 'Founded Year',
                'name' => 'founded_year',
                'type' => 'number',
                'instructions' => 'Year the company was founded',
                'default_value' => 2001,
            ),
            array(
                'key' => 'field_headquarters_address',
                'label' => 'Headquarters Address',
                'name' => 'headquarters_address',
                'type' => 'textarea',
                'instructions' => 'Main headquarters address',
                'rows' => 2,
                'default_value' => 'St. Louis, MO',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'options_page',
                    'operator' => '==',
                    'value' => 'theme-general-settings',
                ),
            ),
        ),
        'menu_order' => 0,
        'position' => 'normal',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
    ));
}

// Hook into ACF initialization
add_action('acf/init', 'historic_equity_register_acf_field_groups');

/**
 * Force refresh ACF field groups and clear cache
 */
function historic_equity_refresh_acf_fields() {
    if (function_exists('acf_get_local_field_groups')) {
        // Clear ACF cache
        if (function_exists('acf_reset_local')) {
            acf_reset_local();
        }

        // Clear WordPress object cache
        wp_cache_flush();

        // Force re-registration
        historic_equity_register_acf_field_groups();
    }
}

// Add admin action to refresh fields
add_action('admin_init', function() {
    if (isset($_GET['refresh_acf']) && current_user_can('manage_options')) {
        historic_equity_refresh_acf_fields();
        wp_redirect(admin_url('edit.php?post_type=page&refreshed=1'));
        exit;
    }
});

/**
 * Add Options Page for Global Content
 */
function historic_equity_add_options_page() {
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page(array(
            'page_title' => 'Theme General Settings',
            'menu_title' => 'Theme Settings',
            'menu_slug' => 'theme-general-settings',
            'capability' => 'edit_posts',
            'icon_url' => 'dashicons-admin-customizer',
        ));
    }
}
add_action('acf/init', 'historic_equity_add_options_page');

/**
 * Add Generic Page Content Field Group for other pages
 */
function historic_equity_add_generic_page_fields() {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    // Generic Page Content Fields
    acf_add_local_field_group(array(
        'key' => 'group_generic_page_content',
        'title' => 'Generic Page Content',
        'fields' => array(
            // Hero Section
            array(
                'key' => 'field_page_hero_title',
                'label' => 'Page Hero Title',
                'name' => 'page_hero_title',
                'type' => 'text',
                'instructions' => 'Main title for this page',
            ),
            array(
                'key' => 'field_page_hero_subtitle',
                'label' => 'Page Hero Subtitle',
                'name' => 'page_hero_subtitle',
                'type' => 'textarea',
                'instructions' => 'Supporting text below the page title',
                'rows' => 3,
            ),
            array(
                'key' => 'field_page_hero_image',
                'label' => 'Page Hero Image',
                'name' => 'page_hero_image',
                'type' => 'image',
                'instructions' => 'Hero image for this page',
                'return_format' => 'array',
                'preview_size' => 'medium',
            ),

            // Main Content
            array(
                'key' => 'field_page_main_content',
                'label' => 'Main Content',
                'name' => 'page_main_content',
                'type' => 'wysiwyg',
                'instructions' => 'Main content for this page',
                'tabs' => 'all',
                'toolbar' => 'full',
                'media_upload' => 1,
            ),

            // Content Sections (Flexible Content)
            array(
                'key' => 'field_page_content_sections',
                'label' => 'Content Sections',
                'name' => 'page_content_sections',
                'type' => 'flexible_content',
                'instructions' => 'Add flexible content sections',
                'button_label' => 'Add Content Section',
                'layouts' => array(
                    'text_section' => array(
                        'key' => 'layout_text_section',
                        'name' => 'text_section',
                        'label' => 'Text Section',
                        'display' => 'block',
                        'sub_fields' => array(
                            array(
                                'key' => 'field_text_section_title',
                                'label' => 'Section Title',
                                'name' => 'section_title',
                                'type' => 'text',
                            ),
                            array(
                                'key' => 'field_text_section_content',
                                'label' => 'Section Content',
                                'name' => 'section_content',
                                'type' => 'wysiwyg',
                                'tabs' => 'all',
                                'toolbar' => 'full',
                                'media_upload' => 1,
                            ),
                        ),
                    ),
                    'image_text_section' => array(
                        'key' => 'layout_image_text_section',
                        'name' => 'image_text_section',
                        'label' => 'Image + Text Section',
                        'display' => 'block',
                        'sub_fields' => array(
                            array(
                                'key' => 'field_image_text_title',
                                'label' => 'Section Title',
                                'name' => 'section_title',
                                'type' => 'text',
                            ),
                            array(
                                'key' => 'field_image_text_content',
                                'label' => 'Section Content',
                                'name' => 'section_content',
                                'type' => 'wysiwyg',
                                'tabs' => 'all',
                                'toolbar' => 'full',
                            ),
                            array(
                                'key' => 'field_image_text_image',
                                'label' => 'Section Image',
                                'name' => 'section_image',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                            ),
                            array(
                                'key' => 'field_image_text_layout',
                                'label' => 'Layout',
                                'name' => 'layout',
                                'type' => 'select',
                                'choices' => array(
                                    'image_left' => 'Image Left, Text Right',
                                    'image_right' => 'Image Right, Text Left',
                                ),
                                'default_value' => 'image_left',
                            ),
                        ),
                    ),
                    'call_to_action' => array(
                        'key' => 'layout_call_to_action',
                        'name' => 'call_to_action',
                        'label' => 'Call to Action',
                        'display' => 'block',
                        'sub_fields' => array(
                            array(
                                'key' => 'field_cta_section_title',
                                'label' => 'CTA Title',
                                'name' => 'cta_title',
                                'type' => 'text',
                            ),
                            array(
                                'key' => 'field_cta_section_content',
                                'label' => 'CTA Content',
                                'name' => 'cta_content',
                                'type' => 'textarea',
                                'rows' => 3,
                            ),
                            array(
                                'key' => 'field_cta_section_button_text',
                                'label' => 'Button Text',
                                'name' => 'button_text',
                                'type' => 'text',
                            ),
                            array(
                                'key' => 'field_cta_section_button_link',
                                'label' => 'Button Link',
                                'name' => 'button_link',
                                'type' => 'text',
                            ),
                        ),
                    ),
                ),
            ),

            // SEO Fields
            array(
                'key' => 'field_page_seo_title',
                'label' => 'SEO Title',
                'name' => 'page_seo_title',
                'type' => 'text',
                'instructions' => 'Custom SEO title (leave empty to use page title)',
            ),
            array(
                'key' => 'field_page_seo_description',
                'label' => 'SEO Description',
                'name' => 'page_seo_description',
                'type' => 'textarea',
                'instructions' => 'Meta description for search engines',
                'rows' => 3,
                'maxlength' => 160,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'page',
                ),
                array(
                    'param' => 'page_template',
                    'operator' => '!=',
                    'value' => 'page-contact.php',
                ),
                array(
                    'param' => 'page_template',
                    'operator' => '!=',
                    'value' => 'page-meet-our-team.php',
                ),
                array(
                    'param' => 'page',
                    'operator' => '!=',
                    'value' => get_option('page_on_front'),
                ),
            ),
        ),
        'menu_order' => 10,
        'position' => 'normal',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
    ));
}
add_action('acf/init', 'historic_equity_add_generic_page_fields');