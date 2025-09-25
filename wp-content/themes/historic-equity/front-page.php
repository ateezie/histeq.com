<?php
/**
 * Front Page Template (Homepage)
 * Description: Homepage template using Timber with dedicated Twig template
 */

// Initialize Timber context
$context = \Timber\Timber::get_context();

// Set page-specific data
$context['page'] = \Timber\Timber::get_post();
$context['page_title'] = 'Home';

// Render the dedicated homepage Twig template
\Timber\Timber::render('page-home.twig', $context);