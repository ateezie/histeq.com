<?php
// Direct access to Meet Our Team page
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

// Render the Meet Our Team template
\Timber\Timber::render('page-meet-our-team.twig', $context);
?>