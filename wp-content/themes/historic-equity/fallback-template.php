<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php wp_title('|', true, 'right'); ?><?php bloginfo('name'); ?></title>
    <?php wp_head(); ?>
    <style>
        body { font-family: 'Montserrat', Arial, sans-serif; color: #2D2E3D; background-color: #FEFFF8; margin: 0; }
        .hero { background-color: #BD572B; color: white; padding: 3rem 1rem; text-align: center; }
        .hero h1 { font-size: 2.5rem; margin: 0 0 1rem 0; }
        .hero p { font-size: 1.2rem; margin: 0 0 2rem 0; }
        .btn-primary { background-color: #E6CD41; color: #2D2E3D; padding: 1rem 2rem; text-decoration: none; border-radius: 4px; font-weight: 600; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
        .post { margin-bottom: 2rem; padding: 1.5rem; border: 1px solid #95816E; border-radius: 8px; }
    </style>
</head>
<body <?php body_class(); ?>>

<header class="site-header">
    <div class="hero">
        <h1>Historic Equity Inc.</h1>
        <p>Bridging history & progress through State Historic Tax Credit investment</p>
        <a href="#contact" class="btn-primary">Get Started</a>
    </div>
</header>

<main class="container">
    <?php if (have_posts()) : ?>
        <?php while (have_posts()) : the_post(); ?>
            <article class="post">
                <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                <div><?php the_excerpt(); ?></div>
            </article>
        <?php endwhile; ?>
    <?php else : ?>
        <div class="post">
            <h2>Welcome to Historic Equity Inc.</h2>
            <p>Your trusted partner in State Historic Tax Credit investment. We help maximize benefits for owners of historic rehabilitation projects across 17+ states.</p>

            <h3>Our Services</h3>
            <ul>
                <li>State Historic Tax Credit Investment</li>
                <li>Historic Preservation Consulting</li>
                <li>Project Development Support</li>
                <li>Regulatory Compliance Assistance</li>
            </ul>

            <p><strong>Coverage:</strong> Missouri, Iowa, Kansas, Oklahoma, Minnesota, Wisconsin, Indiana, South Carolina, Texas, Louisiana, Georgia, Maryland, Rhode Island, Virginia, West Virginia, Arkansas, Colorado</p>
        </div>
    <?php endif; ?>
</main>

<footer style="background-color: #2D2E3D; color: #FEFFF8; padding: 2rem; text-align: center;">
    <p>&copy; <?php echo date('Y'); ?> Historic Equity Inc. All rights reserved.</p>
    <p>Founded 2001 | Portfolio: 200+ projects, $1+ billion QRE | Location: St. Louis, MO</p>
</footer>

<?php wp_footer(); ?>
</body>
</html>