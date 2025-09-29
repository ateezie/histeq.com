const { chromium } = require('playwright');

async function testContactForm() {
    const browser = await chromium.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    try {
        console.log('🔍 Testing contact form layout at different viewport sizes...');

        // Navigate to the contact page
        console.log('📍 Navigating to contact page...');
        await page.goto('http://localhost:8080/contact/', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Wait for contact form section to load
        await page.waitForSelector('[data-testid="contact-form"]', { timeout: 10000 });
        console.log('✅ Contact form section loaded');

        // Test different viewport sizes
        const viewports = [
            { name: 'Desktop', width: 1440, height: 900 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Mobile', width: 375, height: 667 }
        ];

        for (const viewport of viewports) {
            console.log(`📱 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);

            // Set viewport size
            await page.setViewportSize({
                width: viewport.width,
                height: viewport.height
            });

            // Wait a moment for layout to adjust
            await page.waitForTimeout(1000);

            // Scroll to contact form
            await page.locator('[data-testid="contact-form"]').scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);

            // Take screenshot of the contact form section
            const screenshot = await page.locator('[data-testid="contact-form"]').screenshot({
                fullPage: false,
                type: 'png'
            });

            // Save screenshot
            require('fs').writeFileSync(`contact-form-${viewport.name.toLowerCase()}.png`, screenshot);
            console.log(`📸 Screenshot saved: contact-form-${viewport.name.toLowerCase()}.png`);

            // Analyze form layout at this viewport
            const formFields = await page.locator('.gform_wrapper .gfield').count();
            console.log(`   📊 Found ${formFields} form fields`);

            // Check field arrangement
            if (viewport.width >= 768) {
                // Desktop/Tablet: Check if first 4 fields are arranged in 2x2 layout
                const field1Rect = await page.locator('.gform_wrapper .gfield:first-child').boundingBox();
                const field2Rect = await page.locator('.gform_wrapper .gfield:nth-child(2)').boundingBox();
                const field3Rect = await page.locator('.gform_wrapper .gfield:nth-child(3)').boundingBox();
                const field4Rect = await page.locator('.gform_wrapper .gfield:nth-child(4)').boundingBox();

                if (field1Rect && field2Rect) {
                    const sameLine = Math.abs(field1Rect.y - field2Rect.y) < 10;
                    console.log(`   📏 First two fields on same line: ${sameLine ? '✅ Yes' : '❌ No'}`);
                    console.log(`   📐 Field 1 Y: ${field1Rect.y}, Field 2 Y: ${field2Rect.y}`);
                }

                if (field3Rect && field4Rect) {
                    const sameLine = Math.abs(field3Rect.y - field4Rect.y) < 10;
                    console.log(`   📏 Fields 3&4 on same line: ${sameLine ? '✅ Yes' : '❌ No'}`);
                    console.log(`   📐 Field 3 Y: ${field3Rect.y}, Field 4 Y: ${field4Rect.y}`);
                }
            } else {
                // Mobile: All fields should stack vertically
                console.log('   📱 Mobile view - fields should be stacked vertically');
            }

            console.log(`   ✅ ${viewport.name} test completed\n`);
        }

        // Test full page screenshot at desktop resolution
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('http://localhost:8080/contact/', { waitUntil: 'networkidle' });
        const fullPageScreenshot = await page.screenshot({
            fullPage: true,
            type: 'png'
        });
        require('fs').writeFileSync('contact-page-full.png', fullPageScreenshot);
        console.log('📸 Full page screenshot saved: contact-page-full.png');

        // Check for any console errors
        console.log('\n🔍 Checking for browser console messages...');
        const logs = [];
        page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));

        await page.reload();
        await page.waitForTimeout(2000);

        if (logs.length > 0) {
            console.log('⚠️  Console messages found:');
            logs.forEach(log => console.log(`   ${log}`));
        } else {
            console.log('✅ No console errors or warnings');
        }

    } catch (error) {
        console.error('❌ Error during contact form testing:', error);
    } finally {
        await browser.close();
    }
}

testContactForm();