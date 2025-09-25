<?php
/**
 * Historic Equity WordPress Theme - Index Template
 *
 * @package HistoricEquity
 */

if (class_exists('Timber\Timber')) {
    $context = Timber\Timber::context();

    // Add any additional context data
    if (function_exists('add_to_context')) {
        $context = add_to_context($context);
    }

    // Render the homepage template
    Timber\Timber::render('index.twig', $context);
} else {
    // Fallback for missing Timber
    get_header();
    ?>
    <main class="site-main">
        <div class="container">
            <h1>Historic Equity Inc.</h1>
            <p>State Historic Tax Credit Investment Specialists</p>
            <p>Please install the Timber plugin to enable full theme functionality.</p>
        </div>
    </main>
    <?php
    get_footer();
}
?>