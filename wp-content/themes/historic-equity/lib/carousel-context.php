<?php
/**
 * Carousel Context Extension for Timber
 *
 * Provides carousel-specific data to Twig templates
 * following WordPress and Timber best practices
 *
 * @package HistoricEquity
 * @since 1.0.0
 */

namespace HistoricEquity\Carousel;

class CarouselContext {

    /**
     * Initialize carousel context hooks
     */
    public static function init() {
        add_filter('timber/context', [self::class, 'add_carousel_context']);
    }

    /**
     * Add carousel-specific context to Timber
     *
     * @param array $context Existing Timber context
     * @return array Enhanced context with carousel data
     */
    public static function add_carousel_context($context) {
        // Only add carousel context on pages that use it
        if (is_front_page()) {
            $context['building_carousel'] = self::get_building_carousel_data();
        }

        return $context;
    }

    /**
     * Get building carousel data
     *
     * @return array Carousel configuration and data
     */
    private static function get_building_carousel_data() {
        // Get carousel slides from ACF or other source
        $slides = self::get_carousel_slides();

        return [
            'slides' => $slides,
            'config' => [
                'auto_play' => true,
                'auto_play_delay' => 5000,
                'show_indicators' => count($slides) > 1,
                'show_arrows' => count($slides) > 1,
                'enable_touch' => true,
                'enable_keyboard' => true,
                'pause_on_hover' => true
            ],
            'accessibility' => [
                'carousel_label' => __('Historic Equity building images carousel', 'historic-equity'),
                'slide_label_template' => __('Slide %d of %d', 'historic-equity'),
                'previous_label' => __('Previous slide', 'historic-equity'),
                'next_label' => __('Next slide', 'historic-equity'),
                'indicator_label_template' => __('Go to slide %d', 'historic-equity')
            ]
        ];
    }

    /**
     * Get carousel slides data
     *
     * @return array Array of slide data
     */
    private static function get_carousel_slides() {
        // Check for ACF field first
        if (function_exists('get_field')) {
            $acf_slides = get_field('building_carousel_slides', get_the_ID());
            if ($acf_slides && is_array($acf_slides)) {
                return array_map([self::class, 'format_slide_data'], $acf_slides);
            }
        }

        // Fallback to hardcoded slides for demo/development
        return self::get_default_slides();
    }

    /**
     * Format slide data for consistency
     *
     * @param array $slide_data Raw slide data
     * @return array Formatted slide data
     */
    private static function format_slide_data($slide_data) {
        return [
            'id' => $slide_data['id'] ?? uniqid('slide_'),
            'image' => [
                'url' => $slide_data['image']['url'] ?? '',
                'alt' => $slide_data['image']['alt'] ?? '',
                'title' => $slide_data['image']['title'] ?? ''
            ],
            'content' => [
                'title' => sanitize_text_field($slide_data['title'] ?? ''),
                'description' => sanitize_text_field($slide_data['description'] ?? ''),
                'amount' => sanitize_text_field($slide_data['amount'] ?? ''),
                'location' => sanitize_text_field($slide_data['location'] ?? '')
            ],
            'link' => [
                'url' => esc_url($slide_data['link_url'] ?? ''),
                'text' => sanitize_text_field($slide_data['link_text'] ?? __('Learn More', 'historic-equity')),
                'target' => $slide_data['link_target'] ?? '_self'
            ]
        ];
    }

    /**
     * Get default slides for development/fallback
     *
     * @return array Default slide data
     */
    private static function get_default_slides() {
        $theme_uri = get_template_directory_uri();

        return [
            [
                'id' => 'slide_1',
                'image' => [
                    'url' => $theme_uri . '/static/images/projects/historic-building-1.jpg',
                    'alt' => 'Historic brick building renovation',
                    'title' => 'Historic Building Renovation'
                ],
                'content' => [
                    'title' => 'Downtown Historic District',
                    'description' => 'Adaptive reuse of 1920s commercial building',
                    'amount' => '$2.4M Investment',
                    'location' => 'St. Louis, MO'
                ],
                'link' => [
                    'url' => '/projects/downtown-historic-district',
                    'text' => 'View Project',
                    'target' => '_self'
                ]
            ],
            [
                'id' => 'slide_2',
                'image' => [
                    'url' => $theme_uri . '/static/images/projects/historic-building-2.jpg',
                    'alt' => 'Victorian era mansion restoration',
                    'title' => 'Victorian Mansion Restoration'
                ],
                'content' => [
                    'title' => 'Heritage Mansion Complex',
                    'description' => 'Victorian era mansion converted to luxury apartments',
                    'amount' => '$3.8M Investment',
                    'location' => 'Kansas City, MO'
                ],
                'link' => [
                    'url' => '/projects/heritage-mansion-complex',
                    'text' => 'View Project',
                    'target' => '_self'
                ]
            ],
            [
                'id' => 'slide_3',
                'image' => [
                    'url' => $theme_uri . '/static/images/projects/historic-building-3.jpg',
                    'alt' => 'Industrial warehouse conversion',
                    'title' => 'Industrial Warehouse Conversion'
                ],
                'content' => [
                    'title' => 'Mill District Lofts',
                    'description' => '1890s textile mill transformed into modern lofts',
                    'amount' => '$5.2M Investment',
                    'location' => 'Minneapolis, MN'
                ],
                'link' => [
                    'url' => '/projects/mill-district-lofts',
                    'text' => 'View Project',
                    'target' => '_self'
                ]
            ],
            [
                'id' => 'slide_4',
                'image' => [
                    'url' => $theme_uri . '/static/images/projects/historic-building-4.jpg',
                    'alt' => 'Art deco theater restoration',
                    'title' => 'Art Deco Theater Restoration'
                ],
                'content' => [
                    'title' => 'Grand Theater Revival',
                    'description' => '1930s movie palace restored to original grandeur',
                    'amount' => '$4.1M Investment',
                    'location' => 'Des Moines, IA'
                ],
                'link' => [
                    'url' => '/projects/grand-theater-revival',
                    'text' => 'View Project',
                    'target' => '_self'
                ]
            ]
        ];
    }

    /**
     * Get carousel configuration for JavaScript
     *
     * @return array JavaScript configuration
     */
    public static function get_js_config() {
        return apply_filters('historic_equity_carousel_js_config', [
            'autoPlayDelay' => 5000,
            'transitionDuration' => 500,
            'swipeThreshold' => 50,
            'pauseOnHover' => true,
            'keyboardNavigation' => true,
            'touchNavigation' => true,
            'accessibility' => true,
            'debugMode' => WP_DEBUG
        ]);
    }
}

// Initialize carousel context
CarouselContext::init();