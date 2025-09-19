<?php
// Direct access to Contact page
require_once 'wp-content/themes/historic-equity/vendor/autoload.php';

// Initialize Timber loader
\Timber\Timber::$dirname = ['wp-content/themes/historic-equity/templates'];

// Basic context setup
$context = [
    'site' => (object) [
        'name' => 'Historic Equity Inc.',
        'theme' => (object) [
            'path' => '/wp-content/themes/historic-equity'
        ]
    ],
    'theme' => (object) [
        'link' => '/wp-content/themes/historic-equity'
    ]
];

// Render the Contact template
\Timber\Timber::render('page-contact.twig', $context);
?>