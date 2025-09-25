<?php
/**
 * Image Optimization and WebP Conversion for Historic Equity Inc.
 *
 * Advanced image optimization system with WebP conversion, responsive images,
 * and performance enhancements for SHTC project portfolios.
 *
 * @package HistoricEquity
 */

if (!defined('ABSPATH')) {
    exit;
}

class ImageOptimizationBackend {

    /**
     * Initialize image optimization
     */
    public static function init() {
        add_action('after_setup_theme', [__CLASS__, 'setup_image_sizes']);
        add_filter('wp_generate_attachment_metadata', [__CLASS__, 'generate_webp_versions'], 10, 2);
        add_filter('wp_get_attachment_image_src', [__CLASS__, 'serve_webp_if_supported'], 10, 4);
        add_filter('the_content', [__CLASS__, 'optimize_content_images']);
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_optimization_scripts']);
        add_action('wp_ajax_he_optimize_image', [__CLASS__, 'ajax_optimize_image']);
        add_action('wp_ajax_nopriv_he_optimize_image', [__CLASS__, 'ajax_optimize_image']);
        add_filter('wp_calculate_image_srcset', [__CLASS__, 'add_webp_to_srcset'], 10, 5);
    }

    /**
     * Setup image sizes for Historic Equity
     */
    public static function setup_image_sizes() {
        // Remove default sizes we don't need
        remove_image_size('medium_large');

        // Add Historic Equity specific sizes
        add_image_size('project-thumbnail', 400, 300, true); // Project grid
        add_image_size('project-featured', 800, 600, true);  // Project detail
        add_image_size('project-gallery', 1200, 900, true); // Gallery display
        add_image_size('project-hero', 1920, 1080, true);   // Hero banners
        add_image_size('team-member', 300, 300, true);      // Team photos
        add_image_size('testimonial-avatar', 100, 100, true); // Testimonials
        add_image_size('blog-thumbnail', 600, 400, true);   // Blog posts
        add_image_size('og-image', 1200, 630, true);        // Social sharing

        // Responsive breakpoint sizes
        add_image_size('mobile-small', 320, 240, true);
        add_image_size('mobile-medium', 480, 360, true);
        add_image_size('tablet', 768, 576, true);
        add_image_size('desktop', 1024, 768, true);
        add_image_size('desktop-large', 1440, 1080, true);
    }

    /**
     * Generate WebP versions when images are uploaded
     */
    public static function generate_webp_versions($metadata, $attachment_id) {
        if (!function_exists('imagewebp')) {
            return $metadata; // WebP not supported
        }

        $file = get_attached_file($attachment_id);
        if (!$file || !file_exists($file)) {
            return $metadata;
        }

        // Check if it's an image
        $image_info = getimagesize($file);
        if (!$image_info || !in_array($image_info['mime'], ['image/jpeg', 'image/png'])) {
            return $metadata;
        }

        try {
            // Generate WebP for original image
            self::create_webp_version($file);

            // Generate WebP for all sizes
            if (isset($metadata['sizes']) && is_array($metadata['sizes'])) {
                $upload_dir = wp_upload_dir();
                $base_dir = dirname($file);

                foreach ($metadata['sizes'] as $size => $size_data) {
                    $size_file = $base_dir . '/' . $size_data['file'];
                    if (file_exists($size_file)) {
                        self::create_webp_version($size_file);
                    }
                }
            }
        } catch (Exception $e) {
            error_log('WebP generation error: ' . $e->getMessage());
        }

        return $metadata;
    }

    /**
     * Create WebP version of an image
     */
    private static function create_webp_version($file_path) {
        if (!function_exists('imagewebp')) {
            return false;
        }

        $webp_path = preg_replace('/\.(jpe?g|png)$/i', '.webp', $file_path);

        // Skip if WebP already exists and is newer
        if (file_exists($webp_path) && filemtime($webp_path) >= filemtime($file_path)) {
            return true;
        }

        $image_info = getimagesize($file_path);
        if (!$image_info) {
            return false;
        }

        $image = null;
        switch ($image_info['mime']) {
            case 'image/jpeg':
                $image = imagecreatefromjpeg($file_path);
                break;
            case 'image/png':
                $image = imagecreatefrompng($file_path);
                // Preserve transparency
                imagepalettetotruecolor($image);
                imagealphablending($image, true);
                imagesavealpha($image, true);
                break;
            default:
                return false;
        }

        if (!$image) {
            return false;
        }

        // Apply optimization settings
        $quality = self::get_webp_quality($file_path);
        $success = imagewebp($image, $webp_path, $quality);

        imagedestroy($image);

        if ($success) {
            // Set appropriate permissions
            chmod($webp_path, 0644);
            return true;
        }

        return false;
    }

    /**
     * Get optimal WebP quality based on image characteristics
     */
    private static function get_webp_quality($file_path) {
        $file_size = filesize($file_path);
        $image_info = getimagesize($file_path);

        // Base quality
        $quality = 85;

        // Adjust based on file size
        if ($file_size > 2 * 1024 * 1024) { // > 2MB
            $quality = 75;
        } elseif ($file_size > 1 * 1024 * 1024) { // > 1MB
            $quality = 80;
        }

        // Adjust based on dimensions
        $pixels = $image_info[0] * $image_info[1];
        if ($pixels > 2073600) { // > 1920x1080
            $quality = min($quality, 75);
        }

        // For project images, maintain higher quality
        $upload_dir = wp_upload_dir();
        $relative_path = str_replace($upload_dir['basedir'], '', $file_path);
        if (strpos($relative_path, 'project') !== false) {
            $quality = min($quality + 5, 90);
        }

        return $quality;
    }

    /**
     * Serve WebP images if browser supports it
     */
    public static function serve_webp_if_supported($image, $attachment_id, $size, $icon) {
        if (!$image || !self::browser_supports_webp()) {
            return $image;
        }

        $webp_url = self::get_webp_url($image[0]);
        if ($webp_url && self::webp_file_exists($webp_url)) {
            $image[0] = $webp_url;
        }

        return $image;
    }

    /**
     * Check if browser supports WebP
     */
    private static function browser_supports_webp() {
        if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'image/webp') !== false) {
            return true;
        }

        // Check user agent for browsers that support WebP
        if (isset($_SERVER['HTTP_USER_AGENT'])) {
            $user_agent = $_SERVER['HTTP_USER_AGENT'];

            // Chrome, Opera, Edge, Firefox (recent versions)
            if (preg_match('/Chrome|CriOS|Opera|OPR|Edge|Firefox/', $user_agent)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get WebP URL from original URL
     */
    private static function get_webp_url($original_url) {
        return preg_replace('/\.(jpe?g|png)$/i', '.webp', $original_url);
    }

    /**
     * Check if WebP file exists
     */
    private static function webp_file_exists($webp_url) {
        $upload_dir = wp_upload_dir();
        $webp_path = str_replace($upload_dir['baseurl'], $upload_dir['basedir'], $webp_url);
        return file_exists($webp_path);
    }

    /**
     * Optimize images in content
     */
    public static function optimize_content_images($content) {
        if (!is_string($content)) {
            return $content;
        }

        // Add lazy loading and optimization attributes
        $content = preg_replace_callback(
            '/<img([^>]+)>/i',
            [__CLASS__, 'optimize_img_tag'],
            $content
        );

        return $content;
    }

    /**
     * Optimize individual img tags
     */
    private static function optimize_img_tag($matches) {
        $img_tag = $matches[0];
        $attributes = $matches[1];

        // Skip if already optimized
        if (strpos($attributes, 'data-optimized') !== false) {
            return $img_tag;
        }

        // Extract src
        if (!preg_match('/src=["\']([^"\']+)["\']/', $attributes, $src_match)) {
            return $img_tag;
        }

        $src = $src_match[1];
        $new_attributes = $attributes;

        // Add lazy loading if not present
        if (strpos($attributes, 'loading=') === false) {
            $new_attributes .= ' loading="lazy"';
        }

        // Add decoding async if not present
        if (strpos($attributes, 'decoding=') === false) {
            $new_attributes .= ' decoding="async"';
        }

        // Add optimization class
        if (strpos($attributes, 'class=') !== false) {
            $new_attributes = preg_replace('/class=["\']([^"\']*)["\']/', 'class="$1 optimized-image"', $new_attributes);
        } else {
            $new_attributes .= ' class="optimized-image"';
        }

        // Add WebP source if supported
        $webp_src = self::get_webp_url($src);
        if (self::webp_file_exists($webp_src)) {
            // Create picture element with WebP fallback
            return sprintf(
                '<picture><source srcset="%s" type="image/webp"><img%s data-optimized="true"></picture>',
                esc_attr($webp_src),
                $new_attributes
            );
        }

        // Add optimization marker
        $new_attributes .= ' data-optimized="true"';

        return '<img' . $new_attributes . '>';
    }

    /**
     * Add WebP sources to srcset
     */
    public static function add_webp_to_srcset($sources, $size_array, $image_src, $image_meta, $attachment_id) {
        if (!self::browser_supports_webp() || !is_array($sources)) {
            return $sources;
        }

        $webp_sources = [];
        foreach ($sources as $width => $source) {
            $webp_url = self::get_webp_url($source['url']);
            if (self::webp_file_exists($webp_url)) {
                $webp_sources[$width] = [
                    'url' => $webp_url,
                    'descriptor' => $source['descriptor'],
                    'value' => $source['value']
                ];
            }
        }

        // Return WebP sources if available, otherwise original
        return !empty($webp_sources) ? $webp_sources : $sources;
    }

    /**
     * Enqueue optimization scripts
     */
    public static function enqueue_optimization_scripts() {
        wp_localize_script('historic-equity-images', 'HeImageOptimization', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('he_image_optimization'),
            'webp_support' => self::browser_supports_webp(),
            'lazy_loading_offset' => 100,
            'quality_settings' => self::get_quality_settings()
        ]);
    }

    /**
     * Get quality settings based on connection
     */
    private static function get_quality_settings() {
        // Default settings
        $settings = [
            'jpeg_quality' => 85,
            'webp_quality' => 85,
            'png_compression' => 6,
            'progressive_jpeg' => true
        ];

        // Detect connection speed (rough estimate)
        if (isset($_SERVER['HTTP_CONNECTION']) && strpos($_SERVER['HTTP_CONNECTION'], 'slow') !== false) {
            $settings['jpeg_quality'] = 75;
            $settings['webp_quality'] = 75;
        }

        return $settings;
    }

    /**
     * AJAX image optimization endpoint
     */
    public static function ajax_optimize_image() {
        if (!wp_verify_nonce($_POST['nonce'], 'he_image_optimization')) {
            wp_send_json_error('Invalid nonce');
            return;
        }

        $attachment_id = intval($_POST['attachment_id']);
        if (!$attachment_id) {
            wp_send_json_error('Invalid attachment ID');
            return;
        }

        try {
            $file = get_attached_file($attachment_id);
            if (!$file) {
                wp_send_json_error('File not found');
                return;
            }

            // Generate WebP version
            $webp_created = self::create_webp_version($file);

            // Optimize original image
            $optimized = self::optimize_image_file($file);

            wp_send_json_success([
                'webp_created' => $webp_created,
                'optimized' => $optimized,
                'file_size_before' => filesize($file),
                'webp_url' => $webp_created ? self::get_webp_url(wp_get_attachment_url($attachment_id)) : null
            ]);

        } catch (Exception $e) {
            wp_send_json_error('Optimization failed: ' . $e->getMessage());
        }
    }

    /**
     * Optimize image file (reduce file size)
     */
    private static function optimize_image_file($file_path) {
        $image_info = getimagesize($file_path);
        if (!$image_info) {
            return false;
        }

        $original_size = filesize($file_path);
        $image = null;

        switch ($image_info['mime']) {
            case 'image/jpeg':
                $image = imagecreatefromjpeg($file_path);
                if ($image) {
                    // Apply progressive JPEG and optimize quality
                    imageinterlace($image, 1);
                    $success = imagejpeg($image, $file_path, 85);
                }
                break;

            case 'image/png':
                $image = imagecreatefrompng($file_path);
                if ($image) {
                    // Optimize PNG compression
                    imagepalettetotruecolor($image);
                    imagealphablending($image, true);
                    imagesavealpha($image, true);
                    $success = imagepng($image, $file_path, 6);
                }
                break;

            default:
                return false;
        }

        if ($image) {
            imagedestroy($image);
        }

        $new_size = filesize($file_path);
        return [
            'success' => isset($success) && $success,
            'original_size' => $original_size,
            'new_size' => $new_size,
            'savings' => $original_size - $new_size,
            'savings_percent' => $original_size > 0 ? round((($original_size - $new_size) / $original_size) * 100, 2) : 0
        ];
    }

    /**
     * Bulk optimize existing images
     */
    public static function bulk_optimize_images($limit = 10) {
        $attachments = get_posts([
            'post_type' => 'attachment',
            'post_mime_type' => ['image/jpeg', 'image/png'],
            'post_status' => 'inherit',
            'posts_per_page' => $limit,
            'meta_query' => [
                [
                    'key' => '_he_webp_generated',
                    'compare' => 'NOT EXISTS'
                ]
            ]
        ]);

        $results = [];
        foreach ($attachments as $attachment) {
            $file = get_attached_file($attachment->ID);
            if ($file && file_exists($file)) {
                $webp_created = self::create_webp_version($file);
                $optimized = self::optimize_image_file($file);

                if ($webp_created) {
                    update_post_meta($attachment->ID, '_he_webp_generated', time());
                }

                $results[] = [
                    'id' => $attachment->ID,
                    'file' => basename($file),
                    'webp_created' => $webp_created,
                    'optimized' => $optimized
                ];
            }
        }

        return $results;
    }

    /**
     * Get image optimization stats
     */
    public static function get_optimization_stats() {
        global $wpdb;

        // Count total images
        $total_images = $wpdb->get_var("
            SELECT COUNT(*)
            FROM {$wpdb->posts}
            WHERE post_type = 'attachment'
            AND post_mime_type IN ('image/jpeg', 'image/png')
        ");

        // Count WebP versions
        $webp_images = $wpdb->get_var("
            SELECT COUNT(*)
            FROM {$wpdb->postmeta}
            WHERE meta_key = '_he_webp_generated'
        ");

        // Calculate optimization percentage
        $optimization_percentage = $total_images > 0 ? round(($webp_images / $total_images) * 100, 2) : 0;

        return [
            'total_images' => $total_images,
            'webp_images' => $webp_images,
            'optimization_percentage' => $optimization_percentage,
            'webp_support_enabled' => function_exists('imagewebp'),
            'browser_webp_support' => self::browser_supports_webp()
        ];
    }

    /**
     * Clean up old WebP files
     */
    public static function cleanup_webp_files() {
        $upload_dir = wp_upload_dir();
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($upload_dir['basedir'])
        );

        $cleaned = 0;
        foreach ($iterator as $file) {
            if ($file->getExtension() === 'webp') {
                $original_file = preg_replace('/\.webp$/', '.jpg', $file->getPathname());
                if (!file_exists($original_file)) {
                    $original_file = preg_replace('/\.webp$/', '.png', $file->getPathname());
                }

                // Remove orphaned WebP files
                if (!file_exists($original_file)) {
                    unlink($file->getPathname());
                    $cleaned++;
                }
            }
        }

        return $cleaned;
    }
}

// Initialize image optimization
ImageOptimizationBackend::init();