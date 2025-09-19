<?php
/**
 * Template Name: Contact Us
 * Description: Contact Us page template using Timber
 */

// Initialize Timber context
$context = Timber::get_context();

// Set page-specific data
$context['page'] = Timber::get_post();
$context['page_title'] = 'Contact Us';

// Render the Twig template
Timber::render('page-contact.twig', $context);