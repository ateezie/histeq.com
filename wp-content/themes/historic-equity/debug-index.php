<?php
/**
 * Debug version of index.php for Historic Equity theme
 */

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo '<h1>Historic Equity Theme Debug</h1>';

try {
    // Check if Timber is available
    if (class_exists('Timber\Timber')) {
        echo '<p>✅ Timber is available</p>';

        // Try to create context
        $context = Timber\Timber::context();
        echo '<p>✅ Timber context created</p>';

        // Check for our functions
        if (function_exists('add_to_context')) {
            $context = add_to_context($context);
            echo '<p>✅ Custom context function works</p>';
        } else {
            echo '<p>❌ Custom context function not found</p>';
        }

        // Try to render a simple template
        if (file_exists(get_template_directory() . '/templates/index.twig')) {
            echo '<p>✅ Index template found</p>';
            Timber\Timber::render('index.twig', $context);
        } else {
            echo '<p>❌ Index template not found</p>';
            echo '<p>Template directory: ' . get_template_directory() . '</p>';
        }

    } else {
        echo '<p>❌ Timber not available</p>';
        echo '<p>Loading fallback template...</p>';

        // Fallback to simple HTML
        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?>>
        <head>
            <meta charset="<?php bloginfo('charset'); ?>">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title><?php bloginfo('name'); ?></title>
            <?php wp_head(); ?>
        </head>
        <body <?php body_class(); ?>>
            <div class="site-wrapper">
                <header class="site-header">
                    <div class="container">
                        <h1><?php bloginfo('name'); ?></h1>
                        <p><?php bloginfo('description'); ?></p>
                    </div>
                </header>

                <main class="site-main">
                    <div class="container">
                        <h2>Historic Equity Theme - Debug Mode</h2>
                        <p>This is a debug version of our Historic Equity theme.</p>

                        <?php if (have_posts()) : ?>
                            <?php while (have_posts()) : the_post(); ?>
                                <article class="post">
                                    <h3><?php the_title(); ?></h3>
                                    <div class="content">
                                        <?php the_content(); ?>
                                    </div>
                                </article>
                            <?php endwhile; ?>
                        <?php else : ?>
                            <p>No posts found.</p>
                        <?php endif; ?>
                    </div>
                </main>

                <footer class="site-footer">
                    <div class="container">
                        <p>&copy; <?php echo date('Y'); ?> Historic Equity Inc.</p>
                    </div>
                </footer>
            </div>
            <?php wp_footer(); ?>
        </body>
        </html>
        <?php
    }

} catch (Exception $e) {
    echo '<p>❌ Error: ' . $e->getMessage() . '</p>';
    echo '<p>File: ' . $e->getFile() . '</p>';
    echo '<p>Line: ' . $e->getLine() . '</p>';
}
?>