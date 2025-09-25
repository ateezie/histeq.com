<?php
/**
 * WordPress Media Library Integration for Historic Equity Inc.
 *
 * Enhanced media handling for project galleries, responsive images, and SHTC-optimized assets
 *
 * @package HistoricEquity
 */

namespace HistoricEquity;

/**
 * Media Integration Manager
 *
 * Provides comprehensive WordPress media library integration with
 * project gallery management, responsive image handling, and
 * performance optimization for Historic Equity's visual content.
 */
class MediaIntegration {

    /**
     * Initialize media integration
     */
    public static function init() {
        add_action('after_setup_theme', [__CLASS__, 'add_image_sizes']);
        add_action('init', [__CLASS__, 'register_media_taxonomies']);
        add_filter('timber/context', [__CLASS__, 'add_media_context']);
        add_filter('wp_get_attachment_image_attributes', [__CLASS__, 'enhance_image_attributes'], 10, 3);
        add_filter('wp_calculate_image_srcset', [__CLASS__, 'optimize_image_srcset'], 10, 5);
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_media_scripts']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_admin_media_scripts']);
        add_filter('attachment_fields_to_edit', [__CLASS__, 'add_attachment_fields'], 10, 2);
        add_filter('attachment_fields_to_save', [__CLASS__, 'save_attachment_fields'], 10, 2);
    }

    /**
     * Add Historic Equity specific image sizes
     */
    public static function add_image_sizes() {
        // Project showcase images
        add_image_size('project-thumbnail', 400, 300, true);
        add_image_size('project-featured', 800, 600, true);
        add_image_size('project-gallery', 1200, 900, true);
        add_image_size('project-hero', 1920, 1080, true);

        // Team and company images
        add_image_size('team-member', 300, 300, true);
        add_image_size('company-logo', 400, 200, false);
        add_image_size('partner-logo', 200, 100, false);

        // Content and blog images
        add_image_size('content-featured', 800, 450, true);
        add_image_size('content-thumbnail', 300, 200, true);
        add_image_size('blog-hero', 1200, 600, true);

        // Social and sharing images
        add_image_size('social-share', 1200, 630, true);
        add_image_size('og-image', 1200, 630, true);

        // Mobile-optimized sizes
        add_image_size('mobile-hero', 768, 576, true);
        add_image_size('mobile-thumbnail', 300, 225, true);

        // Enable responsive images for all custom sizes
        add_theme_support('responsive-embeds');
        add_theme_support('post-thumbnails');
    }

    /**
     * Register media taxonomies for organization
     */
    public static function register_media_taxonomies() {
        // Project phase taxonomy for project images
        register_taxonomy('media_project_phase', 'attachment', [
            'labels' => [
                'name' => __('Project Phases', 'historic-equity'),
                'singular_name' => __('Project Phase', 'historic-equity'),
                'search_items' => __('Search Project Phases', 'historic-equity'),
                'all_items' => __('All Project Phases', 'historic-equity'),
                'edit_item' => __('Edit Project Phase', 'historic-equity'),
                'update_item' => __('Update Project Phase', 'historic-equity'),
                'add_new_item' => __('Add New Project Phase', 'historic-equity'),
                'new_item_name' => __('New Project Phase Name', 'historic-equity'),
                'menu_name' => __('Project Phases', 'historic-equity'),
            ],
            'hierarchical' => true,
            'show_ui' => true,
            'show_admin_column' => true,
            'query_var' => true,
            'rewrite' => ['slug' => 'project-phase'],
            'public' => false,
            'show_in_rest' => true
        ]);

        // Media usage taxonomy
        register_taxonomy('media_usage', 'attachment', [
            'labels' => [
                'name' => __('Media Usage', 'historic-equity'),
                'singular_name' => __('Usage', 'historic-equity'),
                'search_items' => __('Search Usage Types', 'historic-equity'),
                'all_items' => __('All Usage Types', 'historic-equity'),
                'edit_item' => __('Edit Usage Type', 'historic-equity'),
                'update_item' => __('Update Usage Type', 'historic-equity'),
                'add_new_item' => __('Add New Usage Type', 'historic-equity'),
                'new_item_name' => __('New Usage Type Name', 'historic-equity'),
                'menu_name' => __('Usage Types', 'historic-equity'),
            ],
            'hierarchical' => false,
            'show_ui' => true,
            'show_admin_column' => true,
            'query_var' => true,
            'rewrite' => ['slug' => 'media-usage'],
            'public' => false,
            'show_in_rest' => true
        ]);

        // Add default terms
        self::create_default_media_terms();
    }

    /**
     * Add media context to Timber
     *
     * @param array $context Timber context
     * @return array Enhanced context
     */
    public static function add_media_context($context) {
        // Featured project galleries
        $context['project_galleries'] = self::get_project_galleries();

        // Company media assets
        $context['company_assets'] = [
            'logos' => self::get_company_logos(),
            'team_photos' => self::get_team_photos(),
            'office_photos' => self::get_office_photos(),
            'brand_assets' => self::get_brand_assets()
        ];

        // Media configuration for components
        $context['media_config'] = [
            'lazy_loading' => [
                'enabled' => true,
                'threshold' => '50px',
                'placeholder' => get_template_directory_uri() . '/static/images/placeholder.svg'
            ],
            'responsive_images' => [
                'breakpoints' => [
                    'mobile' => 768,
                    'tablet' => 1024,
                    'desktop' => 1280,
                    'large' => 1600
                ],
                'quality' => 85,
                'format' => 'webp_fallback'
            ],
            'gallery_settings' => [
                'lightbox_enabled' => true,
                'zoom_enabled' => true,
                'thumbnails_enabled' => true,
                'auto_play' => false,
                'transition_speed' => 400
            ]
        ];

        // Image size information for templates
        $context['image_sizes'] = self::get_available_image_sizes();

        return $context;
    }

    /**
     * Enhance image attributes for accessibility and performance
     *
     * @param array $attr Image attributes
     * @param object $attachment Attachment object
     * @param string|array $size Image size
     * @return array Enhanced attributes
     */
    public static function enhance_image_attributes($attr, $attachment, $size) {
        // Add loading attribute for performance
        if (!isset($attr['loading'])) {
            $attr['loading'] = 'lazy';
        }

        // Enhance alt text if empty
        if (empty($attr['alt'])) {
            $attr['alt'] = self::generate_alt_text($attachment);
        }

        // Add project-specific attributes
        if (self::is_project_image($attachment)) {
            $attr['data-project-id'] = self::get_project_id_from_attachment($attachment);
            $attr['itemscope'] = '';
            $attr['itemtype'] = 'https://schema.org/ImageObject';
        }

        // Add SHTC-specific attributes
        if (self::is_shtc_related_image($attachment)) {
            $attr['data-shtc-related'] = 'true';
        }

        // Add responsive classes based on size
        $responsive_class = self::get_responsive_class_for_size($size);
        if ($responsive_class) {
            $attr['class'] = isset($attr['class']) ? $attr['class'] . ' ' . $responsive_class : $responsive_class;
        }

        return $attr;
    }

    /**
     * Optimize image srcset for performance
     *
     * @param array $sources Image sources
     * @param array $size_array Image size array
     * @param string $image_src Image source URL
     * @param array $image_meta Image metadata
     * @param int $attachment_id Attachment ID
     * @return array Optimized sources
     */
    public static function optimize_image_srcset($sources, $size_array, $image_src, $image_meta, $attachment_id) {
        // Remove sources that are too large for mobile
        if (wp_is_mobile()) {
            foreach ($sources as $width => $source) {
                if ($width > 1200) {
                    unset($sources[$width]);
                }
            }
        }

        // Add WebP sources if supported
        if (self::webp_supported()) {
            $sources = self::add_webp_sources($sources, $attachment_id);
        }

        return $sources;
    }

    /**
     * Get project galleries organized by project
     *
     * @return array Project galleries
     */
    private static function get_project_galleries() {
        $cache_key = 'he_project_galleries_' . get_current_blog_id();
        $galleries = wp_cache_get($cache_key);

        if (false === $galleries) {
            $projects = \Timber\Timber::get_posts([
                'post_type' => 'project_showcase',
                'posts_per_page' => -1,
                'post_status' => 'publish'
            ]);

            $galleries = [];
            foreach ($projects as $project) {
                $gallery_images = self::get_project_gallery_images($project->ID);
                if (!empty($gallery_images)) {
                    $galleries[$project->ID] = [
                        'project' => $project,
                        'images' => $gallery_images,
                        'featured_image' => $project->thumbnail(),
                        'gallery_config' => self::get_project_gallery_config($project->ID)
                    ];
                }
            }

            wp_cache_set($cache_key, $galleries, '', HOUR_IN_SECONDS * 3);
        }

        return $galleries;
    }

    /**
     * Get project gallery images for a specific project
     *
     * @param int $project_id Project ID
     * @return array Gallery images
     */
    private static function get_project_gallery_images($project_id) {
        // Get images from ACF gallery field
        $gallery_images = get_field('project_gallery', $project_id);

        if (empty($gallery_images)) {
            // Fallback: get attached images
            $gallery_images = get_attached_media('image', $project_id);
        }

        $formatted_images = [];
        foreach ($gallery_images as $image) {
            if (is_array($image)) {
                // ACF format
                $attachment_id = $image['ID'];
            } else {
                // WordPress attachment format
                $attachment_id = $image->ID;
            }

            $formatted_images[] = [
                'id' => $attachment_id,
                'thumbnail' => wp_get_attachment_image_src($attachment_id, 'project-thumbnail'),
                'medium' => wp_get_attachment_image_src($attachment_id, 'project-featured'),
                'large' => wp_get_attachment_image_src($attachment_id, 'project-gallery'),
                'full' => wp_get_attachment_image_src($attachment_id, 'full'),
                'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
                'caption' => wp_get_attachment_caption($attachment_id),
                'description' => get_post_field('post_content', $attachment_id),
                'phase' => self::get_project_phase($attachment_id),
                'metadata' => wp_get_attachment_metadata($attachment_id)
            ];
        }

        return $formatted_images;
    }

    /**
     * Get company logos
     *
     * @return array Company logos
     */
    private static function get_company_logos() {
        return [
            'primary' => [
                'dark' => get_template_directory_uri() . '/static/images/logo__black.png',
                'light' => get_template_directory_uri() . '/static/images/logo__white.png',
                'color' => get_template_directory_uri() . '/static/images/logo__color.png'
            ],
            'icon' => [
                'dark' => get_template_directory_uri() . '/static/images/logo-icon__black.png',
                'light' => get_template_directory_uri() . '/static/images/logo-icon__white.png',
                'color' => get_template_directory_uri() . '/static/images/logo-icon__color.png'
            ],
            'text' => [
                'dark' => get_template_directory_uri() . '/static/images/logo-text__black.png',
                'light' => get_template_directory_uri() . '/static/images/logo-text__white.png',
                'color' => get_template_directory_uri() . '/static/images/logo-text__color.png'
            ]
        ];
    }

    /**
     * Get team photos
     *
     * @return array Team photos
     */
    private static function get_team_photos() {
        return get_posts([
            'post_type' => 'attachment',
            'post_mime_type' => 'image',
            'posts_per_page' => -1,
            'meta_query' => [
                [
                    'key' => '_historic_equity_usage',
                    'value' => 'team-photo',
                    'compare' => '='
                ]
            ]
        ]);
    }

    /**
     * Enqueue media-related scripts
     */
    public static function enqueue_media_scripts() {
        // Lightbox script for project galleries
        wp_enqueue_script(
            'historic-equity-lightbox',
            get_template_directory_uri() . '/static/js/lightbox.js',
            ['jquery'],
            filemtime(get_template_directory() . '/static/js/lightbox.js'),
            true
        );

        // Lazy loading script
        wp_enqueue_script(
            'historic-equity-lazy-load',
            get_template_directory_uri() . '/static/js/lazy-load.js',
            [],
            filemtime(get_template_directory() . '/static/js/lazy-load.js'),
            true
        );

        // Gallery management script
        wp_enqueue_script(
            'historic-equity-gallery',
            get_template_directory_uri() . '/static/js/gallery.js',
            ['jquery'],
            filemtime(get_template_directory() . '/static/js/gallery.js'),
            true
        );

        // Localize media configuration
        wp_localize_script('historic-equity-gallery', 'HeMedia', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('he_media_nonce'),
            'lightbox_config' => [
                'animation_speed' => 400,
                'overlay_opacity' => 0.9,
                'close_on_overlay' => true,
                'show_thumbnails' => true
            ],
            'lazy_load_config' => [
                'threshold' => 50,
                'placeholder' => get_template_directory_uri() . '/static/images/placeholder.svg'
            ]
        ]);
    }

    /**
     * Enqueue admin media scripts
     */
    public static function enqueue_admin_media_scripts($hook) {
        if ($hook === 'upload.php' || $hook === 'post.php' || $hook === 'post-new.php') {
            wp_enqueue_script(
                'historic-equity-admin-media',
                get_template_directory_uri() . '/static/js/admin-media.js',
                ['jquery'],
                filemtime(get_template_directory() . '/static/js/admin-media.js'),
                true
            );
        }
    }

    /**
     * Add custom attachment fields
     *
     * @param array $fields Attachment fields
     * @param object $post Attachment post
     * @return array Enhanced fields
     */
    public static function add_attachment_fields($fields, $post) {
        // Historic Equity usage field
        $fields['historic_equity_usage'] = [
            'label' => __('Historic Equity Usage', 'historic-equity'),
            'input' => 'select',
            'options' => [
                '' => __('Select Usage Type', 'historic-equity'),
                'project-before' => __('Project - Before Rehabilitation', 'historic-equity'),
                'project-during' => __('Project - During Rehabilitation', 'historic-equity'),
                'project-after' => __('Project - After Rehabilitation', 'historic-equity'),
                'team-photo' => __('Team Member Photo', 'historic-equity'),
                'office-photo' => __('Office Photo', 'historic-equity'),
                'logo-variation' => __('Logo Variation', 'historic-equity'),
                'marketing-material' => __('Marketing Material', 'historic-equity'),
                'case-study' => __('Case Study Image', 'historic-equity'),
                'blog-featured' => __('Blog Featured Image', 'historic-equity'),
                'social-media' => __('Social Media Image', 'historic-equity')
            ],
            'value' => get_post_meta($post->ID, '_historic_equity_usage', true)
        ];

        // Project association field
        $fields['project_association'] = [
            'label' => __('Associated Project', 'historic-equity'),
            'input' => 'select',
            'options' => self::get_project_options(),
            'value' => get_post_meta($post->ID, '_project_association', true)
        ];

        // Image optimization notes
        $fields['optimization_notes'] = [
            'label' => __('Optimization Notes', 'historic-equity'),
            'input' => 'textarea',
            'value' => get_post_meta($post->ID, '_optimization_notes', true),
            'helps' => __('Notes about image optimization, usage requirements, or special handling instructions.', 'historic-equity')
        ];

        return $fields;
    }

    /**
     * Save custom attachment fields
     *
     * @param array $post Post data
     * @param array $attachment Attachment data
     * @return array Post data
     */
    public static function save_attachment_fields($post, $attachment) {
        if (isset($attachment['historic_equity_usage'])) {
            update_post_meta($post['ID'], '_historic_equity_usage', $attachment['historic_equity_usage']);
        }

        if (isset($attachment['project_association'])) {
            update_post_meta($post['ID'], '_project_association', $attachment['project_association']);
        }

        if (isset($attachment['optimization_notes'])) {
            update_post_meta($post['ID'], '_optimization_notes', sanitize_textarea_field($attachment['optimization_notes']));
        }

        return $post;
    }

    /**
     * Helper methods
     */
    private static function create_default_media_terms() {
        // Project phase terms
        $phases = ['Before', 'During', 'After', 'Aerial', 'Interior', 'Exterior'];
        foreach ($phases as $phase) {
            if (!term_exists($phase, 'media_project_phase')) {
                wp_insert_term($phase, 'media_project_phase');
            }
        }

        // Usage terms
        $usages = ['Project Gallery', 'Team Photo', 'Marketing Material', 'Case Study', 'Blog Image'];
        foreach ($usages as $usage) {
            if (!term_exists($usage, 'media_usage')) {
                wp_insert_term($usage, 'media_usage');
            }
        }
    }

    private static function generate_alt_text($attachment) {
        $title = get_the_title($attachment->ID);
        $usage = get_post_meta($attachment->ID, '_historic_equity_usage', true);

        if ($usage && $title) {
            return sprintf('%s - %s', $title, ucwords(str_replace('-', ' ', $usage)));
        }

        return $title ?: 'Historic Equity project image';
    }

    private static function is_project_image($attachment) {
        $usage = get_post_meta($attachment->ID, '_historic_equity_usage', true);
        return strpos($usage, 'project-') === 0;
    }

    private static function is_shtc_related_image($attachment) {
        $usage = get_post_meta($attachment->ID, '_historic_equity_usage', true);
        return in_array($usage, ['project-before', 'project-during', 'project-after', 'case-study']);
    }

    private static function get_project_id_from_attachment($attachment) {
        return get_post_meta($attachment->ID, '_project_association', true);
    }

    private static function get_responsive_class_for_size($size) {
        $size_classes = [
            'project-thumbnail' => 'img-responsive img-project-thumb',
            'project-featured' => 'img-responsive img-project-featured',
            'project-gallery' => 'img-responsive img-project-gallery',
            'team-member' => 'img-responsive img-team-member rounded-full',
            'mobile-hero' => 'img-responsive img-mobile-hero'
        ];

        return $size_classes[$size] ?? 'img-responsive';
    }

    private static function webp_supported() {
        return function_exists('imagewebp');
    }

    private static function add_webp_sources($sources, $attachment_id) {
        // Implementation for WebP source addition
        return $sources;
    }

    private static function get_project_gallery_config($project_id) {
        return [
            'lightbox_enabled' => true,
            'thumbnails_enabled' => true,
            'auto_play' => false,
            'show_captions' => true
        ];
    }

    private static function get_project_phase($attachment_id) {
        $terms = wp_get_object_terms($attachment_id, 'media_project_phase');
        return !empty($terms) ? $terms[0]->name : '';
    }

    private static function get_available_image_sizes() {
        return [
            'project-thumbnail' => ['width' => 400, 'height' => 300],
            'project-featured' => ['width' => 800, 'height' => 600],
            'project-gallery' => ['width' => 1200, 'height' => 900],
            'team-member' => ['width' => 300, 'height' => 300],
            'mobile-hero' => ['width' => 768, 'height' => 576]
        ];
    }

    private static function get_project_options() {
        $projects = get_posts([
            'post_type' => 'project_showcase',
            'posts_per_page' => -1,
            'post_status' => 'publish'
        ]);

        $options = ['' => __('No Association', 'historic-equity')];
        foreach ($projects as $project) {
            $options[$project->ID] = $project->post_title;
        }

        return $options;
    }

    // Additional helper methods for office photos, brand assets, etc.
    private static function get_office_photos() { return []; }
    private static function get_brand_assets() { return []; }
}

// Initialize media integration
MediaIntegration::init();