<?php
/**
 * Template Name: Meet Our Team
 * Description: Meet Our Team page template using Timber
 */

// Initialize Timber context
$context = Timber::get_context();

// Set page-specific data
$context['page'] = Timber::get_post();
$context['page_title'] = 'Meet Our Team';

// Render the Twig template
Timber::render('page-meet-our-team.twig', $context);