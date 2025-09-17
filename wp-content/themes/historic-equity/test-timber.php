<?php
/**
 * Test Timber Loading
 */
define('WP_USE_THEMES', false);
require_once('/var/www/html/wp-load.php');

echo "<h1>Timber Debug Test</h1>";

// Test 1: Check if autoload exists
echo "<h2>1. Autoload Check</h2>";
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    echo "✅ Autoload file exists<br>";
    require_once __DIR__ . '/vendor/autoload.php';
    echo "✅ Autoload required successfully<br>";
} else {
    echo "❌ Autoload file missing<br>";
}

// Test 2: Check Timber class
echo "<h2>2. Timber Class Check</h2>";
if (class_exists('Timber\Timber')) {
    echo "✅ Timber class exists<br>";
    try {
        $timber = new Timber\Timber();
        echo "✅ Timber instance created<br>";
    } catch (Exception $e) {
        echo "❌ Timber instantiation failed: " . $e->getMessage() . "<br>";
    }
} else {
    echo "❌ Timber class not found<br>";
}

// Test 3: Test context
echo "<h2>3. Context Test</h2>";
try {
    if (class_exists('Timber\Timber')) {
        $context = Timber\Timber::context();
        echo "✅ Context created: " . count($context) . " items<br>";
    }
} catch (Exception $e) {
    echo "❌ Context failed: " . $e->getMessage() . "<br>";
}

// Test 4: Test template directory
echo "<h2>4. Template Directory</h2>";
if (is_dir(__DIR__ . '/templates')) {
    echo "✅ Templates directory exists<br>";
    $files = scandir(__DIR__ . '/templates');
    echo "Files: " . implode(', ', array_filter($files, function($f) { return $f !== '.' && $f !== '..'; })) . "<br>";
} else {
    echo "❌ Templates directory missing<br>";
}

echo "<p>Test complete!</p>";
?>