<?php
/**
 * Form Processing and Email Notifications for Historic Equity Inc.
 *
 * Comprehensive form handling for lead generation and SHTC consultation requests
 *
 * @package HistoricEquity
 */

namespace HistoricEquity;

/**
 * Form Processing Manager
 *
 * Handles all form submissions, lead processing, email notifications,
 * and integration with SHTC-specific business logic for Historic Equity.
 */
class FormProcessing {

    /**
     * Initialize form processing
     */
    public static function init() {
        add_action('wp_ajax_he_contact_form', [__CLASS__, 'process_contact_form']);
        add_action('wp_ajax_nopriv_he_contact_form', [__CLASS__, 'process_contact_form']);
        add_action('wp_ajax_he_newsletter_signup', [__CLASS__, 'process_newsletter_signup']);
        add_action('wp_ajax_nopriv_he_newsletter_signup', [__CLASS__, 'process_newsletter_signup']);
        add_action('wp_ajax_he_project_evaluation', [__CLASS__, 'process_project_evaluation']);
        add_action('wp_ajax_nopriv_he_project_evaluation', [__CLASS__, 'process_project_evaluation']);
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_form_scripts']);
        add_action('init', [__CLASS__, 'schedule_form_follow_ups']);
        add_filter('timber/context', [__CLASS__, 'add_form_context']);
    }

    /**
     * Process main contact form submission
     */
    public static function process_contact_form() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'] ?? '', 'historic_equity_nonce')) {
            wp_send_json_error(['message' => 'Security verification failed.']);
        }

        // Rate limiting
        if (!self::check_rate_limit($_SERVER['REMOTE_ADDR'])) {
            wp_send_json_error(['message' => 'Too many requests. Please try again later.']);
        }

        // Sanitize and validate input
        $form_data = self::sanitize_contact_form_data($_POST);
        $validation_result = self::validate_contact_form_data($form_data);

        if (!$validation_result['valid']) {
            wp_send_json_error([
                'message' => 'Please correct the following errors:',
                'errors' => $validation_result['errors']
            ]);
        }

        // Spam protection
        if (self::is_spam_submission($form_data)) {
            wp_send_json_error(['message' => 'Submission flagged as spam.']);
        }

        // Process the lead
        $lead_id = self::create_contact_lead($form_data);

        if ($lead_id) {
            // Send notifications
            $notifications_sent = self::send_contact_notifications($lead_id, $form_data);

            // Schedule follow-up tasks
            self::schedule_lead_follow_up($lead_id, $form_data);

            // Track analytics
            self::track_form_submission('contact', $form_data);

            // Prepare response
            $response = [
                'success' => true,
                'message' => 'Thank you for your interest! We\'ll contact you within 24 hours to discuss your historic rehabilitation project.',
                'lead_id' => $lead_id,
                'next_steps' => self::get_next_steps_message($form_data),
                'consultation_link' => self::get_consultation_booking_link($form_data)
            ];

            // Add download link for SHTC guide
            if (self::qualifies_for_shtc_guide($form_data)) {
                $response['shtc_guide_download'] = home_url('/resources/shtc-investment-guide/');
            }

            wp_send_json_success($response);
        } else {
            wp_send_json_error(['message' => 'Sorry, there was an error processing your request. Please try again or call us directly.']);
        }
    }

    /**
     * Process newsletter signup
     */
    public static function process_newsletter_signup() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'] ?? '', 'historic_equity_nonce')) {
            wp_send_json_error(['message' => 'Security verification failed.']);
        }

        $email = sanitize_email($_POST['email'] ?? '');
        $interests = array_map('sanitize_text_field', $_POST['interests'] ?? []);

        if (!is_email($email)) {
            wp_send_json_error(['message' => 'Please enter a valid email address.']);
        }

        // Check if already subscribed
        if (self::is_email_subscribed($email)) {
            wp_send_json_success(['message' => 'You\'re already subscribed to our newsletter!']);
        }

        // Add to newsletter list
        $subscription_id = self::add_newsletter_subscription($email, $interests);

        if ($subscription_id) {
            // Send welcome email
            self::send_newsletter_welcome_email($email, $interests);

            // Track subscription
            self::track_form_submission('newsletter', ['email' => $email, 'interests' => $interests]);

            wp_send_json_success([
                'message' => 'Successfully subscribed! Check your email for our SHTC resource guide.',
                'subscription_id' => $subscription_id
            ]);
        } else {
            wp_send_json_error(['message' => 'Sorry, there was an error processing your subscription.']);
        }
    }

    /**
     * Process project evaluation request
     */
    public static function process_project_evaluation() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'] ?? '', 'historic_equity_nonce')) {
            wp_send_json_error(['message' => 'Security verification failed.']);
        }

        // Extended form data for project evaluation
        $form_data = self::sanitize_project_evaluation_data($_POST);
        $validation_result = self::validate_project_evaluation_data($form_data);

        if (!$validation_result['valid']) {
            wp_send_json_error([
                'message' => 'Please complete all required fields:',
                'errors' => $validation_result['errors']
            ]);
        }

        // SHTC eligibility pre-screening
        $eligibility_score = self::calculate_shtc_eligibility_score($form_data);

        // Create detailed lead record
        $lead_id = self::create_evaluation_lead($form_data, $eligibility_score);

        if ($lead_id) {
            // Priority handling for high-value leads
            $is_priority_lead = self::is_priority_lead($form_data, $eligibility_score);

            // Send appropriate notifications
            self::send_evaluation_notifications($lead_id, $form_data, $is_priority_lead);

            // Schedule evaluation process
            self::schedule_project_evaluation($lead_id, $form_data, $is_priority_lead);

            // Track evaluation request
            self::track_form_submission('project_evaluation', $form_data);

            $response = [
                'success' => true,
                'message' => 'Project evaluation request submitted successfully!',
                'lead_id' => $lead_id,
                'eligibility_score' => $eligibility_score['percentage'],
                'estimated_timeline' => self::get_evaluation_timeline($is_priority_lead),
                'next_steps' => self::get_evaluation_next_steps($eligibility_score)
            ];

            // Add calendar booking for high-scoring projects
            if ($eligibility_score['percentage'] >= 70) {
                $response['consultation_booking'] = self::get_consultation_booking_link($form_data);
                $response['priority_processing'] = true;
            }

            wp_send_json_success($response);
        } else {
            wp_send_json_error(['message' => 'Error processing evaluation request. Please try again.']);
        }
    }

    /**
     * Create contact lead record
     *
     * @param array $form_data Form data
     * @return int|false Lead ID or false on failure
     */
    private static function create_contact_lead($form_data) {
        $lead_data = [
            'post_title' => sprintf(
                'Lead: %s %s - %s',
                $form_data['first_name'],
                $form_data['last_name'],
                $form_data['project_location']
            ),
            'post_type' => 'contact_lead',
            'post_status' => 'publish',
            'post_content' => $form_data['message'],
            'meta_input' => [
                'first_name' => $form_data['first_name'],
                'last_name' => $form_data['last_name'],
                'email' => $form_data['email'],
                'phone' => $form_data['phone'] ?? '',
                'project_location' => $form_data['project_location'],
                'property_type' => $form_data['property_type'],
                'lead_source' => $form_data['referral_source'] ?? 'Website Contact Form',
                'lead_status' => 'new',
                'lead_priority' => self::calculate_lead_priority($form_data),
                'submission_ip' => $_SERVER['REMOTE_ADDR'],
                'submission_user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
                'submission_timestamp' => current_time('mysql'),
                'consent_marketing' => $form_data['consent_marketing'] ?? false,
                'follow_up_scheduled' => false
            ]
        ];

        return wp_insert_post($lead_data);
    }

    /**
     * Send contact form notifications
     *
     * @param int $lead_id Lead ID
     * @param array $form_data Form data
     * @return bool Success status
     */
    private static function send_contact_notifications($lead_id, $form_data) {
        $notifications_sent = 0;

        // Send notification to Historic Equity team
        $team_notification = self::send_team_notification($lead_id, $form_data);
        if ($team_notification) $notifications_sent++;

        // Send auto-response to lead
        $auto_response = self::send_lead_auto_response($form_data);
        if ($auto_response) $notifications_sent++;

        // Send SMS alert for high-priority leads
        if (self::is_high_priority_lead($form_data)) {
            $sms_alert = self::send_sms_alert($lead_id, $form_data);
            if ($sms_alert) $notifications_sent++;
        }

        return $notifications_sent > 0;
    }

    /**
     * Send team notification email
     *
     * @param int $lead_id Lead ID
     * @param array $form_data Form data
     * @return bool Success status
     */
    private static function send_team_notification($lead_id, $form_data) {
        $to = get_option('historic_equity_lead_email', get_option('admin_email'));
        $subject = sprintf('[Historic Equity] New Lead: %s %s', $form_data['first_name'], $form_data['last_name']);

        $message = self::get_team_notification_template($lead_id, $form_data);

        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: Historic Equity Website <noreply@' . self::get_domain() . '>',
            'Reply-To: ' . $form_data['email']
        ];

        return wp_mail($to, $subject, $message, $headers);
    }

    /**
     * Send auto-response to lead
     *
     * @param array $form_data Form data
     * @return bool Success status
     */
    private static function send_lead_auto_response($form_data) {
        $to = $form_data['email'];
        $subject = 'Thank you for contacting Historic Equity - Next Steps for Your Project';

        $message = self::get_auto_response_template($form_data);

        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: Historic Equity Inc. <info@' . self::get_domain() . '>',
            'Bcc: ' . get_option('historic_equity_lead_email', get_option('admin_email'))
        ];

        // Attach SHTC guide if applicable
        $attachments = [];
        if (self::qualifies_for_shtc_guide($form_data)) {
            $attachments[] = self::get_shtc_guide_path();
        }

        return wp_mail($to, $subject, $message, $headers, $attachments);
    }

    /**
     * Calculate SHTC eligibility score
     *
     * @param array $form_data Form data
     * @return array Eligibility score and breakdown
     */
    private static function calculate_shtc_eligibility_score($form_data) {
        $score = 0;
        $max_score = 100;
        $breakdown = [];

        // Property type scoring
        $property_type_scores = [
            'Commercial' => 25,
            'Industrial' => 25,
            'Institutional' => 20,
            'Mixed-Use' => 20,
            'Residential' => 15
        ];
        $property_score = $property_type_scores[$form_data['property_type']] ?? 10;
        $score += $property_score;
        $breakdown['property_type'] = $property_score;

        // Project timeline scoring
        $timeline_scores = [
            '0-6 months' => 25,
            '6-12 months' => 20,
            '1-2 years' => 15,
            '2+ years' => 10,
            'Planning phase' => 5
        ];
        $timeline_score = $timeline_scores[$form_data['project_timeline']] ?? 5;
        $score += $timeline_score;
        $breakdown['timeline'] = $timeline_score;

        // Budget range scoring
        $budget_scores = [
            '$5M+' => 30,
            '$1M-$5M' => 25,
            '$500K-$1M' => 15,
            '$100K-$500K' => 10,
            'Not sure' => 5
        ];
        $budget_score = $budget_scores[$form_data['budget_range']] ?? 5;
        $score += $budget_score;
        $breakdown['budget'] = $budget_score;

        // Location scoring (based on state coverage)
        $state = self::extract_state_from_location($form_data['project_location']);
        $location_score = self::get_state_coverage_score($state);
        $score += $location_score;
        $breakdown['location'] = $location_score;

        return [
            'total_score' => $score,
            'max_score' => $max_score,
            'percentage' => round(($score / $max_score) * 100),
            'breakdown' => $breakdown,
            'eligibility_level' => self::get_eligibility_level($score, $max_score)
        ];
    }

    /**
     * Get email templates
     */
    private static function get_team_notification_template($lead_id, $form_data) {
        ob_start();
        include get_template_directory() . '/lib/email-templates/team-notification.php';
        return ob_get_clean();
    }

    private static function get_auto_response_template($form_data) {
        ob_start();
        include get_template_directory() . '/lib/email-templates/auto-response.php';
        return ob_get_clean();
    }

    /**
     * Add form context to Timber
     *
     * @param array $context Timber context
     * @return array Enhanced context
     */
    public static function add_form_context($context) {
        $context['form_processing'] = [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('historic_equity_nonce'),
            'recaptcha_site_key' => get_option('historic_equity_recaptcha_site_key', ''),
            'validation_rules' => self::get_client_validation_rules(),
            'success_messages' => self::get_success_messages(),
            'error_messages' => self::get_error_messages()
        ];

        return $context;
    }

    /**
     * Enqueue form processing scripts
     */
    public static function enqueue_form_scripts() {
        wp_enqueue_script(
            'historic-equity-forms',
            get_template_directory_uri() . '/static/js/forms.js',
            ['jquery'],
            filemtime(get_template_directory() . '/static/js/forms.js'),
            true
        );

        wp_localize_script('historic-equity-forms', 'HeFormsConfig', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('historic_equity_nonce'),
            'validation_rules' => self::get_client_validation_rules(),
            'messages' => [
                'success' => self::get_success_messages(),
                'error' => self::get_error_messages()
            ],
            'recaptcha_enabled' => !empty(get_option('historic_equity_recaptcha_site_key')),
            'analytics_tracking' => true
        ]);

        // Enqueue reCAPTCHA if configured
        $recaptcha_site_key = get_option('historic_equity_recaptcha_site_key');
        if (!empty($recaptcha_site_key)) {
            wp_enqueue_script(
                'google-recaptcha',
                'https://www.google.com/recaptcha/api.js',
                [],
                null,
                true
            );
        }
    }

    /**
     * Helper methods
     */
    private static function sanitize_contact_form_data($post_data) {
        return [
            'first_name' => sanitize_text_field($post_data['first_name'] ?? ''),
            'last_name' => sanitize_text_field($post_data['last_name'] ?? ''),
            'email' => sanitize_email($post_data['email'] ?? ''),
            'phone' => sanitize_text_field($post_data['phone'] ?? ''),
            'project_location' => sanitize_text_field($post_data['project_location'] ?? ''),
            'property_type' => sanitize_text_field($post_data['property_type'] ?? ''),
            'message' => sanitize_textarea_field($post_data['message'] ?? ''),
            'consent_marketing' => !empty($post_data['consent_marketing']),
            'referral_source' => sanitize_text_field($post_data['referral_source'] ?? 'Website')
        ];
    }

    private static function validate_contact_form_data($form_data) {
        $errors = [];

        if (empty($form_data['first_name'])) {
            $errors['first_name'] = 'First name is required.';
        }

        if (empty($form_data['last_name'])) {
            $errors['last_name'] = 'Last name is required.';
        }

        if (empty($form_data['email']) || !is_email($form_data['email'])) {
            $errors['email'] = 'Valid email address is required.';
        }

        if (empty($form_data['project_location'])) {
            $errors['project_location'] = 'Project location is required.';
        }

        if (empty($form_data['property_type'])) {
            $errors['property_type'] = 'Property type is required.';
        }

        if (empty($form_data['message']) || strlen($form_data['message']) < 20) {
            $errors['message'] = 'Please provide at least 20 characters describing your project.';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    private static function check_rate_limit($ip) {
        $cache_key = 'he_rate_limit_' . md5($ip);
        $attempts = wp_cache_get($cache_key);

        if ($attempts === false) {
            wp_cache_set($cache_key, 1, '', HOUR_IN_SECONDS);
            return true;
        }

        if ($attempts >= 5) {
            return false;
        }

        wp_cache_set($cache_key, $attempts + 1, '', HOUR_IN_SECONDS);
        return true;
    }

    private static function is_spam_submission($form_data) {
        // Honeypot field check
        if (!empty($_POST['honeypot'])) {
            return true;
        }

        // Time-based check (too fast submission)
        if (!empty($_POST['form_start_time'])) {
            $submission_time = time() - intval($_POST['form_start_time']);
            if ($submission_time < 3) { // Less than 3 seconds
                return true;
            }
        }

        // Content-based spam detection
        $spam_keywords = ['viagra', 'cialis', 'casino', 'poker', 'loan', 'mortgage'];
        $content = strtolower($form_data['message']);
        foreach ($spam_keywords as $keyword) {
            if (strpos($content, $keyword) !== false) {
                return true;
            }
        }

        return false;
    }

    // Additional helper methods...
    private static function calculate_lead_priority($form_data) { return 'medium'; }
    private static function is_high_priority_lead($form_data) { return false; }
    private static function get_next_steps_message($form_data) { return ''; }
    private static function get_consultation_booking_link($form_data) { return ''; }
    private static function qualifies_for_shtc_guide($form_data) { return true; }
    private static function schedule_lead_follow_up($lead_id, $form_data) { }
    private static function track_form_submission($type, $data) { }
    private static function schedule_form_follow_ups() { }
    private static function get_domain() { return parse_url(home_url(), PHP_URL_HOST); }
    private static function get_client_validation_rules() { return []; }
    private static function get_success_messages() { return []; }
    private static function get_error_messages() { return []; }

    // Newsletter and evaluation methods...
    private static function sanitize_project_evaluation_data($post_data) { return []; }
    private static function validate_project_evaluation_data($form_data) { return ['valid' => true, 'errors' => []]; }
    private static function create_evaluation_lead($form_data, $eligibility_score) { return false; }
    private static function is_priority_lead($form_data, $eligibility_score) { return false; }
    private static function send_evaluation_notifications($lead_id, $form_data, $is_priority) { }
    private static function schedule_project_evaluation($lead_id, $form_data, $is_priority) { }
    private static function get_evaluation_timeline($is_priority) { return ''; }
    private static function get_evaluation_next_steps($eligibility_score) { return ''; }
    private static function extract_state_from_location($location) { return ''; }
    private static function get_state_coverage_score($state) { return 10; }
    private static function get_eligibility_level($score, $max_score) { return 'medium'; }
    private static function is_email_subscribed($email) { return false; }
    private static function add_newsletter_subscription($email, $interests) { return false; }
    private static function send_newsletter_welcome_email($email, $interests) { }
    private static function send_sms_alert($lead_id, $form_data) { return false; }
    private static function get_shtc_guide_path() { return ''; }
}

// Initialize form processing
FormProcessing::init();