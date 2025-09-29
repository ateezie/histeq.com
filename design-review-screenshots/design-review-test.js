const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Design Review Test Suite for Historic Equity Inc.
async function runDesignReview() {
  console.log('🎨 Starting Comprehensive Design Review for Historic Equity Inc.');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    pages: {},
    overall: {
      criticalIssues: [],
      highPriorityIssues: [],
      mediumPriorityIssues: [],
      nitpicks: []
    }
  };

  const pages = [
    { name: 'Homepage', url: 'http://localhost:8080/' },
    { name: 'Meet Our Team', url: 'http://localhost:8080/meet-our-team/' },
    { name: 'Contact', url: 'http://localhost:8080/contact/' }
  ];

  const viewports = [
    { name: 'Desktop', width: 1440, height: 900 },
    { name: 'Laptop', width: 1024, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];

  for (const pageInfo of pages) {
    console.log(`\n📄 Testing ${pageInfo.name}: ${pageInfo.url}`);
    results.pages[pageInfo.name] = {};

    for (const viewport of viewports) {
      console.log(`  📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(pageInfo.url, { waitUntil: 'networkidle' });

      // Wait for page to fully load
      await page.waitForTimeout(2000);

      // Take screenshot
      const screenshotPath = `/Users/alexthip/Projects/histeq.com/review-screenshots/${pageInfo.name.replace(/\s+/g, '-').toLowerCase()}-${viewport.name.toLowerCase()}.png`;
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      // Perform comprehensive analysis
      const analysis = await analyzePageDesign(page, viewport, pageInfo.name);
      results.pages[pageInfo.name][viewport.name] = {
        grade: analysis.grade,
        issues: analysis.issues,
        screenshot: screenshotPath,
        metrics: analysis.metrics
      };

      // Collect issues for overall report
      results.overall.criticalIssues.push(...analysis.issues.critical);
      results.overall.highPriorityIssues.push(...analysis.issues.high);
      results.overall.mediumPriorityIssues.push(...analysis.issues.medium);
      results.overall.nitpicks.push(...analysis.issues.nitpicks);
    }
  }

  await browser.close();

  // Generate comprehensive report
  await generateReport(results);
  console.log('\n✅ Design Review Complete! Check design-review-report.md for detailed findings.');
}

async function analyzePageDesign(page, viewport, pageName) {
  const issues = {
    critical: [],
    high: [],
    medium: [],
    nitpicks: []
  };

  // Check for console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Analyze layout and spacing
  const layoutAnalysis = await page.evaluate(() => {
    const results = {
      verticalSpacing: [],
      horizontalOverflow: false,
      navigationPresent: false,
      footerPresent: false,
      contrastIssues: [],
      accessibilityIssues: []
    };

    // Check for consistent vertical spacing
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
      const computedStyle = window.getComputedStyle(section);
      const paddingTop = parseFloat(computedStyle.paddingTop);
      const paddingBottom = parseFloat(computedStyle.paddingBottom);
      results.verticalSpacing.push({
        index,
        paddingTop,
        paddingBottom,
        className: section.className
      });
    });

    // Check for horizontal overflow
    results.horizontalOverflow = document.body.scrollWidth > window.innerWidth;

    // Check for navigation and footer
    results.navigationPresent = document.querySelector('nav, header nav, .navigation') !== null;
    results.footerPresent = document.querySelector('footer') !== null;

    // Check for accessibility issues
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      results.accessibilityIssues.push(`${imagesWithoutAlt.length} images missing alt text`);
    }

    const linksWithoutText = document.querySelectorAll('a:empty, a:not([aria-label]):not([title])');
    linksWithoutText.forEach(link => {
      if (!link.textContent.trim() && !link.querySelector('img[alt]')) {
        results.accessibilityIssues.push('Link without accessible text found');
      }
    });

    return results;
  });

  // Analyze Brand Consistency
  const brandAnalysis = await page.evaluate(() => {
    const brandColors = {
      primary: '#BD572B', // Primary Orange
      gold: '#E6CD41',    // Primary Gold
      brown: '#95816E',   // Primary Brown
      lightBlue: '#83ACD1', // Light Blue
      offWhite: '#FEFFF8', // Off White
      darkNavy: '#2D2E3D'  // Dark Navy
    };

    const results = {
      colorUsage: [],
      fontConsistency: [],
      logoPresent: false
    };

    // Check for logo
    results.logoPresent = document.querySelector('img[alt*="logo"], img[src*="logo"], .logo') !== null;

    // Check font usage
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      const computedStyle = window.getComputedStyle(heading);
      results.fontConsistency.push({
        tag: heading.tagName,
        fontSize: computedStyle.fontSize,
        fontFamily: computedStyle.fontFamily,
        fontWeight: computedStyle.fontWeight,
        index
      });
    });

    return results;
  });

  // Calculate grade based on issues found
  let gradePoints = 100;

  // Deduct points for issues
  if (layoutAnalysis.horizontalOverflow) {
    issues.critical.push(`${pageName} - ${viewport.name}: Horizontal overflow detected`);
    gradePoints -= 25;
  }

  if (!layoutAnalysis.navigationPresent) {
    issues.high.push(`${pageName} - ${viewport.name}: Navigation not found`);
    gradePoints -= 15;
  }

  if (!layoutAnalysis.footerPresent) {
    issues.high.push(`${pageName} - ${viewport.name}: Footer not found`);
    gradePoints -= 10;
  }

  if (!brandAnalysis.logoPresent) {
    issues.high.push(`${pageName} - ${viewport.name}: Logo not found`);
    gradePoints -= 15;
  }

  if (layoutAnalysis.accessibilityIssues.length > 0) {
    layoutAnalysis.accessibilityIssues.forEach(issue => {
      issues.high.push(`${pageName} - ${viewport.name}: ${issue}`);
      gradePoints -= 5;
    });
  }

  if (consoleErrors.length > 0) {
    issues.medium.push(`${pageName} - ${viewport.name}: ${consoleErrors.length} console errors`);
    gradePoints -= 5;
  }

  // Check spacing consistency
  const spacingVariance = checkSpacingConsistency(layoutAnalysis.verticalSpacing);
  if (spacingVariance > 20) {
    issues.medium.push(`${pageName} - ${viewport.name}: Inconsistent vertical spacing (${spacingVariance}px variance)`);
    gradePoints -= 10;
  }

  // Assign letter grade
  let grade = 'F';
  if (gradePoints >= 90) grade = 'A';
  else if (gradePoints >= 80) grade = 'B';
  else if (gradePoints >= 70) grade = 'C';
  else if (gradePoints >= 60) grade = 'D';

  return {
    grade,
    gradePoints,
    issues,
    metrics: {
      layoutAnalysis,
      brandAnalysis,
      consoleErrors: consoleErrors.length
    }
  };
}

function checkSpacingConsistency(spacingData) {
  if (spacingData.length < 2) return 0;

  const paddingTops = spacingData.map(s => s.paddingTop);
  const paddingBottoms = spacingData.map(s => s.paddingBottom);

  const avgTop = paddingTops.reduce((a, b) => a + b, 0) / paddingTops.length;
  const avgBottom = paddingBottoms.reduce((a, b) => a + b, 0) / paddingBottoms.length;

  const varianceTop = Math.max(...paddingTops) - Math.min(...paddingTops);
  const varianceBottom = Math.max(...paddingBottoms) - Math.min(...paddingBottoms);

  return Math.max(varianceTop, varianceBottom);
}

async function generateReport(results) {
  const screenshotDir = '/Users/alexthip/Projects/histeq.com/review-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  let report = `# Historic Equity Inc. - Comprehensive Design Review Report

## Executive Summary

This report provides a comprehensive analysis of the Historic Equity Inc. website across all pages and device breakpoints, evaluating design consistency, brand alignment, accessibility compliance, and user experience.

## Grade Summary Matrix

| Page | Desktop (1440px) | Laptop (1024px) | Tablet (768px) | Mobile (375px) |
|------|------------------|-----------------|----------------|----------------|`;

  // Add grade matrix
  Object.keys(results.pages).forEach(pageName => {
    const pageResults = results.pages[pageName];
    report += `\n| ${pageName} | ${pageResults.Desktop?.grade || 'N/A'} | ${pageResults.Laptop?.grade || 'N/A'} | ${pageResults.Tablet?.grade || 'N/A'} | ${pageResults.Mobile?.grade || 'N/A'} |`;
  });

  report += `\n\n## Detailed Findings

### Critical Issues (Immediate Fix Required)
`;

  if (results.overall.criticalIssues.length === 0) {
    report += `✅ No critical issues found\n`;
  } else {
    results.overall.criticalIssues.forEach((issue, index) => {
      report += `${index + 1}. **[BLOCKER]** ${issue}\n`;
    });
  }

  report += `\n### High Priority Issues
`;

  if (results.overall.highPriorityIssues.length === 0) {
    report += `✅ No high priority issues found\n`;
  } else {
    results.overall.highPriorityIssues.forEach((issue, index) => {
      report += `${index + 1}. **[HIGH]** ${issue}\n`;
    });
  }

  report += `\n### Medium Priority Issues
`;

  if (results.overall.mediumPriorityIssues.length === 0) {
    report += `✅ No medium priority issues found\n`;
  } else {
    results.overall.mediumPriorityIssues.forEach((issue, index) => {
      report += `${index + 1}. **[MEDIUM]** ${issue}\n`;
    });
  }

  report += `\n### Nitpicks
`;

  if (results.overall.nitpicks.length === 0) {
    report += `✅ No nitpicks found\n`;
  } else {
    results.overall.nitpicks.forEach((issue, index) => {
      report += `${index + 1}. **Nit:** ${issue}\n`;
    });
  }

  report += `\n## Screenshots

Screenshots have been captured for all page/device combinations:

`;

  // Add screenshot references
  Object.keys(results.pages).forEach(pageName => {
    const pageResults = results.pages[pageName];
    report += `### ${pageName}\n`;
    Object.keys(pageResults).forEach(viewport => {
      const screenshotPath = pageResults[viewport].screenshot;
      report += `- **${viewport}**: ![${pageName} ${viewport}](${screenshotPath})\n`;
    });
    report += `\n`;
  });

  report += `\n## Recommendations

Based on this comprehensive review, the following actions are recommended:

1. **Address all critical issues** - These prevent proper functionality
2. **Fix high priority issues** - These significantly impact user experience
3. **Plan medium priority fixes** - These should be addressed in the next sprint
4. **Consider nitpick improvements** - These are aesthetic enhancements

## Design System Compliance

The analysis shows ${results.overall.criticalIssues.length === 0 && results.overall.highPriorityIssues.length === 0 ? 'strong' : 'mixed'} adherence to design system principles with room for improvement in:

- Spacing consistency across sections
- Typography hierarchy implementation
- Brand color usage consistency
- Responsive behavior optimization

## Overall Assessment

${calculateOverallGrade(results)}
`;

  fs.writeFileSync('/Users/alexthip/Projects/histeq.com/design-review-report.md', report);
  console.log('\n📋 Report generated: design-review-report.md');
}

function calculateOverallGrade(results) {
  const totalCritical = results.overall.criticalIssues.length;
  const totalHigh = results.overall.highPriorityIssues.length;
  const totalMedium = results.overall.mediumPriorityIssues.length;

  if (totalCritical === 0 && totalHigh === 0 && totalMedium <= 2) {
    return 'The Historic Equity Inc. website demonstrates **EXCELLENT** design quality with minimal issues. Ready for production deployment.';
  } else if (totalCritical === 0 && totalHigh <= 2) {
    return 'The Historic Equity Inc. website demonstrates **GOOD** design quality with some minor improvements needed.';
  } else if (totalCritical === 0) {
    return 'The Historic Equity Inc. website demonstrates **SATISFACTORY** design quality with several improvements recommended.';
  } else {
    return 'The Historic Equity Inc. website requires **IMMEDIATE ATTENTION** to address critical design issues before production deployment.';
  }
}

// Run the review
runDesignReview().catch(console.error);