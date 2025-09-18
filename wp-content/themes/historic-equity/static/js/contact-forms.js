/**
 * Contact Form AJAX Submission with Validation for Historic Equity Inc.
 *
 * Professional contact form handling for SHTC consultation requests
 * and general inquiries with comprehensive validation and user feedback.
 *
 * @package HistoricEquity
 */

(function($) {
    'use strict';

    /**
     * Contact Form Manager
     */
    class ContactFormManager {
        constructor() {
            this.forms = $('.contact-form, .consultation-form, .newsletter-form');
            this.submitButtons = $('.contact-form .btn-submit, .consultation-form .btn-submit');
            this.messageContainer = $('.form-messages');

            this.submitting = false;
            this.validationRules = this.setupValidationRules();

            this.init();
        }

        /**
         * Initialize contact form functionality
         */
        init() {
            this.setupFormSubmission();
            this.setupRealTimeValidation();
            this.setupFileUploads();
            this.setupPhoneFormatting();
            this.setupAnalytics();

            console.log('Historic Equity Contact Forms initialized');
        }

        /**
         * Setup form submission handling
         */
        setupFormSubmission() {
            this.forms.on('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission($(e.target));
            });

            // Handle retry submissions
            $(document).on('click', '.retry-submission', (e) => {
                e.preventDefault();
                const formId = $(e.target).data('form-id');
                const form = $(`#${formId}`);
                if (form.length) {
                    this.handleFormSubmission(form);
                }
            });
        }

        /**
         * Handle form submission
         */
        async handleFormSubmission(form) {
            if (this.submitting) return;

            const formData = this.collectFormData(form);
            const validationResult = this.validateFormData(formData, form);

            if (!validationResult.isValid) {
                this.displayValidationErrors(validationResult.errors, form);
                return;
            }

            this.submitting = true;
            this.showSubmissionState(form, 'submitting');

            try {
                const response = await this.submitFormData(formData, form);
                this.handleSubmissionSuccess(response, form);
            } catch (error) {
                this.handleSubmissionError(error, form);
            } finally {
                this.submitting = false;
                this.hideSubmissionState(form);
            }
        }

        /**
         * Collect form data
         */
        collectFormData(form) {
            const formData = new FormData(form[0]);
            const data = {};

            // Convert FormData to plain object
            for (let [key, value] of formData.entries()) {
                if (data[key]) {
                    // Handle multiple values (checkboxes, etc.)
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            }

            // Add form metadata
            data.form_type = form.data('form-type') || 'contact';
            data.form_id = form.attr('id');
            data.page_url = window.location.href;
            data.user_agent = navigator.userAgent;
            data.timestamp = new Date().toISOString();

            return data;
        }

        /**
         * Setup validation rules
         */
        setupValidationRules() {
            return {
                required: {
                    fields: ['name', 'email', 'message'],
                    message: 'This field is required.'
                },
                email: {
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address.'
                },
                phone: {
                    pattern: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Please enter a valid phone number.'
                },
                name: {
                    pattern: /^[a-zA-Z\s\-\'\.]{2,50}$/,
                    message: 'Please enter a valid name (2-50 characters).'
                },
                company: {
                    pattern: /^[a-zA-Z0-9\s\-\&\.,\']{2,100}$/,
                    message: 'Please enter a valid company name.'
                },
                message: {
                    minLength: 10,
                    maxLength: 2000,
                    message: 'Message must be between 10 and 2000 characters.'
                },
                project_value: {
                    pattern: /^\d+(\.\d{1,2})?$/,
                    message: 'Please enter a valid project value.'
                }
            };
        }

        /**
         * Validate form data
         */
        validateFormData(data, form) {
            const errors = {};
            let isValid = true;

            // Required field validation
            this.validationRules.required.fields.forEach(field => {
                const fieldValue = data[field];
                if (!fieldValue || fieldValue.toString().trim() === '') {
                    errors[field] = this.validationRules.required.message;
                    isValid = false;
                }
            });

            // Specific field validation
            Object.keys(data).forEach(field => {
                const value = data[field];
                if (!value || typeof value !== 'string') return;

                const rule = this.validationRules[field];
                if (!rule) return;

                // Pattern validation
                if (rule.pattern && !rule.pattern.test(value.trim())) {
                    errors[field] = rule.message;
                    isValid = false;
                }

                // Length validation
                if (rule.minLength && value.trim().length < rule.minLength) {
                    errors[field] = rule.message;
                    isValid = false;
                }

                if (rule.maxLength && value.trim().length > rule.maxLength) {
                    errors[field] = rule.message;
                    isValid = false;
                }
            });

            // SHTC-specific validation
            if (data.form_type === 'consultation') {
                if (!data.project_state || data.project_state === '') {
                    errors.project_state = 'Please select a project state.';
                    isValid = false;
                }

                if (!data.property_type || data.property_type === '') {
                    errors.property_type = 'Please select a property type.';
                    isValid = false;
                }
            }

            // Honeypot validation (spam protection)
            if (data.website && data.website !== '') {
                errors._spam = 'Spam detected.';
                isValid = false;
            }

            return { isValid, errors };
        }

        /**
         * Submit form data via AJAX
         */
        async submitFormData(data, form) {
            const submitData = {
                action: 'he_submit_contact_form',
                nonce: historic_equity_ajax.nonce,
                form_data: data
            };

            return new Promise((resolve, reject) => {
                $.ajax({
                    url: historic_equity_ajax.ajax_url,
                    type: 'POST',
                    data: submitData,
                    timeout: 30000,
                    success: (response) => {
                        if (response.success) {
                            resolve(response.data);
                        } else {
                            reject(new Error(response.data?.message || 'Submission failed'));
                        }
                    },
                    error: (xhr, status, error) => {
                        if (status === 'timeout') {
                            reject(new Error('Request timed out. Please try again.'));
                        } else {
                            reject(new Error('Network error. Please check your connection.'));
                        }
                    }
                });
            });
        }

        /**
         * Handle successful submission
         */
        handleSubmissionSuccess(response, form) {
            // Clear form
            form[0].reset();
            this.clearValidationErrors(form);

            // Show success message
            this.showSuccessMessage(response, form);

            // Track successful submission
            this.trackFormSubmission('success', form.data('form-type'));

            // Redirect if specified
            if (response.redirect_url) {
                setTimeout(() => {
                    window.location.href = response.redirect_url;
                }, 2000);
            }
        }

        /**
         * Handle submission error
         */
        handleSubmissionError(error, form) {
            console.error('Form submission error:', error);

            this.showErrorMessage(error.message, form);
            this.trackFormSubmission('error', form.data('form-type'), error.message);
        }

        /**
         * Display validation errors
         */
        displayValidationErrors(errors, form) {
            this.clearValidationErrors(form);

            Object.keys(errors).forEach(field => {
                if (field === '_spam') return; // Skip spam errors

                const fieldElement = form.find(`[name="${field}"]`);
                const errorMessage = errors[field];

                if (fieldElement.length) {
                    fieldElement.addClass('error');
                    const errorElement = $(`<div class="field-error">${errorMessage}</div>`);
                    fieldElement.closest('.form-group, .field-group').append(errorElement);
                }
            });

            // Focus on first error field
            const firstErrorField = form.find('.error').first();
            if (firstErrorField.length) {
                firstErrorField.focus();

                // Scroll to field if needed
                $('html, body').animate({
                    scrollTop: firstErrorField.offset().top - 100
                }, 300);
            }
        }

        /**
         * Clear validation errors
         */
        clearValidationErrors(form) {
            form.find('.error').removeClass('error');
            form.find('.field-error').remove();
            this.hideMessages();
        }

        /**
         * Setup real-time validation
         */
        setupRealTimeValidation() {
            // Validate on blur
            this.forms.on('blur', 'input, textarea, select', (e) => {
                const field = $(e.target);
                const fieldName = field.attr('name');
                const fieldValue = field.val();

                if (fieldName && fieldValue) {
                    const data = { [fieldName]: fieldValue };
                    const validationResult = this.validateFormData(data, field.closest('form'));

                    if (validationResult.errors[fieldName]) {
                        this.displayFieldError(field, validationResult.errors[fieldName]);
                    } else {
                        this.clearFieldError(field);
                    }
                }
            });

            // Clear errors on input
            this.forms.on('input', 'input, textarea', (e) => {
                const field = $(e.target);
                if (field.hasClass('error')) {
                    this.clearFieldError(field);
                }
            });
        }

        /**
         * Display field-specific error
         */
        displayFieldError(field, message) {
            this.clearFieldError(field);
            field.addClass('error');
            const errorElement = $(`<div class="field-error">${message}</div>`);
            field.closest('.form-group, .field-group').append(errorElement);
        }

        /**
         * Clear field-specific error
         */
        clearFieldError(field) {
            field.removeClass('error');
            field.closest('.form-group, .field-group').find('.field-error').remove();
        }

        /**
         * Show submission states
         */
        showSubmissionState(form, state) {
            const submitBtn = form.find('.btn-submit');

            switch (state) {
                case 'submitting':
                    submitBtn.prop('disabled', true)
                           .addClass('loading')
                           .find('.btn-text').text('Sending...');
                    break;
            }
        }

        hideSubmissionState(form) {
            const submitBtn = form.find('.btn-submit');
            submitBtn.prop('disabled', false)
                     .removeClass('loading')
                     .find('.btn-text').text(submitBtn.data('original-text') || 'Send Message');
        }

        /**
         * Show success message
         */
        showSuccessMessage(response, form) {
            const message = response.message || 'Thank you! Your message has been sent successfully.';
            this.showMessage('success', message, form);
        }

        /**
         * Show error message
         */
        showErrorMessage(message, form) {
            this.showMessage('error', message, form);
        }

        /**
         * Show message with type
         */
        showMessage(type, message, form) {
            const messageContainer = form.find('.form-messages');
            const messageElement = $(`
                <div class="form-message form-message--${type}" role="alert">
                    <div class="message-content">
                        <div class="message-icon">
                            ${type === 'success' ? '✓' : '⚠'}
                        </div>
                        <div class="message-text">${message}</div>
                    </div>
                    <button class="message-close" aria-label="Close message">&times;</button>
                </div>
            `);

            messageContainer.html(messageElement);
            messageElement.slideDown(300);

            // Auto-hide after 5 seconds for success messages
            if (type === 'success') {
                setTimeout(() => {
                    messageElement.slideUp(300, () => messageElement.remove());
                }, 5000);
            }

            // Manual close
            messageElement.find('.message-close').on('click', () => {
                messageElement.slideUp(300, () => messageElement.remove());
            });
        }

        /**
         * Hide messages
         */
        hideMessages() {
            $('.form-message').slideUp(300, function() {
                $(this).remove();
            });
        }

        /**
         * Setup file upload handling
         */
        setupFileUploads() {
            const fileInputs = this.forms.find('input[type="file"]');

            fileInputs.on('change', (e) => {
                const input = $(e.target);
                const files = e.target.files;

                this.validateFileUploads(files, input);
                this.displayFilePreview(files, input);
            });
        }

        /**
         * Validate file uploads
         */
        validateFileUploads(files, input) {
            const maxSize = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

            Array.from(files).forEach(file => {
                if (file.size > maxSize) {
                    this.displayFieldError(input, `File "${file.name}" is too large. Maximum size is 5MB.`);
                } else if (!allowedTypes.includes(file.type)) {
                    this.displayFieldError(input, `File "${file.name}" is not an allowed type.`);
                } else {
                    this.clearFieldError(input);
                }
            });
        }

        /**
         * Display file preview
         */
        displayFilePreview(files, input) {
            const previewContainer = input.closest('.form-group, .field-group').find('.file-preview');
            if (!previewContainer.length) return;

            previewContainer.empty();

            Array.from(files).forEach(file => {
                const filePreview = $(`
                    <div class="file-preview-item">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">(${this.formatFileSize(file.size)})</span>
                    </div>
                `);
                previewContainer.append(filePreview);
            });
        }

        /**
         * Format file size
         */
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        /**
         * Setup phone number formatting
         */
        setupPhoneFormatting() {
            this.forms.on('input', 'input[type="tel"], input[name*="phone"]', (e) => {
                const input = $(e.target);
                let value = input.val().replace(/\D/g, '');

                // Format US phone numbers
                if (value.length >= 10) {
                    value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                } else if (value.length >= 6) {
                    value = value.replace(/(\d{3})(\d{3})/, '($1) $2-');
                } else if (value.length >= 3) {
                    value = value.replace(/(\d{3})/, '($1) ');
                }

                input.val(value);
            });
        }

        /**
         * Setup analytics tracking
         */
        setupAnalytics() {
            // Track form interactions
            this.forms.on('focus', 'input, textarea, select', (e) => {
                const fieldName = $(e.target).attr('name');
                const formType = $(e.target).closest('form').data('form-type');
                this.trackFormInteraction('field_focus', formType, fieldName);
            });

            // Track form abandonment
            let formStarted = false;
            this.forms.on('input', (e) => {
                if (!formStarted) {
                    formStarted = true;
                    const formType = $(e.target).closest('form').data('form-type');
                    this.trackFormInteraction('form_started', formType);

                    // Track abandonment after 30 seconds of inactivity
                    setTimeout(() => {
                        if (!this.submitting) {
                            this.trackFormInteraction('form_abandoned', formType);
                        }
                    }, 30000);
                }
            });
        }

        /**
         * Track form interactions
         */
        trackFormInteraction(action, formType, fieldName = null) {
            // Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', action, {
                    'event_category': 'form_interaction',
                    'event_label': formType,
                    'custom_parameter_1': fieldName
                });
            }

            // Historic Equity analytics
            if (historic_equity_ajax.analytics_endpoint) {
                $.post(historic_equity_ajax.analytics_endpoint, {
                    event: 'form_interaction',
                    action: action,
                    form_type: formType,
                    field_name: fieldName,
                    timestamp: Date.now(),
                    nonce: historic_equity_ajax.nonce
                });
            }
        }

        /**
         * Track form submission
         */
        trackFormSubmission(result, formType, errorMessage = null) {
            // Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submission', {
                    'event_category': 'contact_form',
                    'event_label': formType,
                    'value': result === 'success' ? 1 : 0
                });
            }

            // Historic Equity analytics
            if (historic_equity_ajax.analytics_endpoint) {
                $.post(historic_equity_ajax.analytics_endpoint, {
                    event: 'form_submission',
                    result: result,
                    form_type: formType,
                    error_message: errorMessage,
                    timestamp: Date.now(),
                    nonce: historic_equity_ajax.nonce
                });
            }
        }
    }

    /**
     * Initialize when DOM is ready
     */
    $(document).ready(() => {
        // Only initialize if we have contact forms and AJAX config
        if ($('.contact-form, .consultation-form').length && typeof historic_equity_ajax !== 'undefined') {
            window.HeContactForms = new ContactFormManager();
        }
    });

})(jQuery);