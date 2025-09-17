<?php
/**
 * Main template file
 *
 * @package HistoricEquity
 */

// Enable Timber with proper error handling
if (class_exists('Timber\Timber') && file_exists(__DIR__ . '/templates/index.twig')) {
    try {
        $context = Timber\Timber::context();
        $context['posts'] = Timber\Timber::get_posts();
        Timber\Timber::render('index.twig', $context);
    } catch (Exception $e) {
        // Fall back to PHP template if Timber fails
        error_log('Timber render failed: ' . $e->getMessage());
        include __DIR__ . '/fallback-template.php';
    }
} else {
    // Fallback template
    ?>
    <!DOCTYPE html>
    <html <?php language_attributes(); ?>>
    <head>
        <meta charset="<?php bloginfo('charset'); ?>">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title><?php wp_title('|', true, 'right'); ?></title>
        <?php wp_head(); ?>
    </head>
    <body <?php body_class(); ?>>
        <header>
            <h1><a href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a></h1>
            <p><?php bloginfo('description'); ?></p>
        </header>

        <main>
            <h1>Historic Equity Inc.</h1>
            <p>Bridging history & progress through State Historic Tax Credit investment</p>

            <?php if (have_posts()) : ?>
                <?php while (have_posts()) : the_post(); ?>
                    <article>
                        <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                        <?php the_excerpt(); ?>
                    </article>
                <?php endwhile; ?>
            <?php endif; ?>
        </main>

        <footer>
            <p>&copy; <?php echo date('Y'); ?> Historic Equity Inc. All rights reserved.</p>
        </footer>

        <?php wp_footer(); ?>
    </body>
    </html>
    <?php
}