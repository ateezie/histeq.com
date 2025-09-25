<?php
/**
 * Template Name: Contact Us
 * Description: Contact Us page template using Timber
 */

// Initialize Timber context
$context = \Timber\Timber::get_context();

// Set page-specific data
$context['page'] = \Timber\Timber::get_post();
$context['page_title'] = 'Contact Us';

// Render the Twig template
\Timber\Timber::render('page-contact.twig', $context);