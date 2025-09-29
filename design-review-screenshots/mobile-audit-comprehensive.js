/**
 * COMPREHENSIVE MOBILE UI/UX AUDIT - Historic Equity Inc.
 * CRITICAL FOR CLIENT PRESENTATION TOMORROW
 *
 * This script systematically tests mobile UI/UX issues across all key pages
 * focusing on the critical 15px padding issue and overall mobile experience
 */

const fs = require('fs');
const path = require('path');

// Mobile audit configuration
const config = {
  baseUrl: 'http://localhost:8080',
  mobileViewport: { width: 375, height: 812 }, // iPhone standard
  secondaryViewport: { width: 390, height: 844 }, // iPhone 12+
  pages: [
    { url: '/', name: 'Homepage', priority: 'CRITICAL' },
    { url: '/meet-our-team', name: 'Meet Our Team', priority: 'HIGH' },
    { url: '/contact', name: 'Contact', priority: 'HIGH' }
  ],
  auditAreas: [
    'Global Layout & Spacing',
    'Content Readability',
    'Interactive Elements',
    'Visual Hierarchy',
    'Technical Issues'
  ]
};

// Issue severity levels
const SEVERITY = {
  CRITICAL: 'CRITICAL - Must fix before client presentation',
  HIGH: 'HIGH - Important for professional appearance',
  MEDIUM: 'MEDIUM - Nice-to-have improvements',
  LOW: 'LOW - Future enhancement'
};

class MobileAudit {
  constructor() {
    this.issues = [];
    this.screenshots = [];
    this.auditReport = {
      timestamp: new Date().toISOString(),
      summary: {},
      pages: {},
      recommendations: []
    };
  }

  // Add issue to audit report
  addIssue(page, category, severity, description, element = null, screenshot = null) {
    const issue = {
      id: `issue-${this.issues.length + 1}`,
      page,
      category,
      severity,
      description,
      element,
      screenshot,
      timestamp: new Date().toISOString()
    };

    this.issues.push(issue);

    if (!this.auditReport.pages[page]) {
      this.auditReport.pages[page] = { issues: [] };
    }
    this.auditReport.pages[page].issues.push(issue);
  }

  // Check for horizontal padding issues
  async checkHorizontalPadding(page, pageName) {
    console.log(`\n🔍 CHECKING HORIZONTAL PADDING: ${pageName}`);

    // Check body and main container padding
    const bodyPadding = await page.evaluate(() => {
      const body = document.body;
      const style = window.getComputedStyle(body);
      return {
        paddingLeft: style.paddingLeft,
        paddingRight: style.paddingRight,
        marginLeft: style.marginLeft,
        marginRight: style.marginRight
      };
    });

    console.log('Body padding:', bodyPadding);

    // Check container elements
    const containerPadding = await page.evaluate(() => {
      const containers = document.querySelectorAll('.container, .container-fluid, [class*="container"]');
      const results = [];

      containers.forEach((container, index) => {
        const style = window.getComputedStyle(container);
        const rect = container.getBoundingClientRect();

        results.push({
          index,
          className: container.className,
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight,
          marginLeft: style.marginLeft,
          marginRight: style.marginRight,
          left: rect.left,
          right: rect.right,
          width: rect.width
        });
      });

      return results;
    });

    console.log('Container padding details:', containerPadding);

    // Check for content touching screen edges
    const edgeProblems = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const problems = [];
      const viewportWidth = window.innerWidth;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();

        // Check if content is touching or very close to edges
        if (rect.left < 8 && rect.width > 50) { // Less than 8px from left edge
          problems.push({
            element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
            issue: 'Content too close to left edge',
            left: rect.left,
            className: el.className
          });
        }

        if (rect.right > viewportWidth - 8 && rect.width > 50) { // Less than 8px from right edge
          problems.push({
            element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
            issue: 'Content too close to right edge',
            right: rect.right,
            viewportWidth,
            className: el.className
          });
        }
      });

      return problems;
    });

    // Analyze padding issues
    containerPadding.forEach((container, index) => {
      const leftPadding = parseInt(container.paddingLeft);
      const rightPadding = parseInt(container.paddingRight);

      if (leftPadding < 15 || rightPadding < 15) {
        this.addIssue(
          pageName,
          'Global Layout & Spacing',
          'CRITICAL',
          `Container ${index} has insufficient horizontal padding. Left: ${container.paddingLeft}, Right: ${container.paddingRight}. Should be minimum 15px. Class: ${container.className}`
        );
      }
    });

    // Check edge problems
    if (edgeProblems.length > 0) {
      edgeProblems.forEach(problem => {
        this.addIssue(
          pageName,
          'Global Layout & Spacing',
          'CRITICAL',
          `${problem.element} - ${problem.issue}. Position: left=${problem.left}, right=${problem.right}`
        );
      });
    }
  }

  // Check content readability on mobile
  async checkContentReadability(page, pageName) {
    console.log(`\n📖 CHECKING CONTENT READABILITY: ${pageName}`);

    const readabilityIssues = await page.evaluate(() => {
      const issues = [];

      // Check font sizes
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, li');

      textElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseInt(style.fontSize);
        const lineHeight = parseFloat(style.lineHeight);
        const textContent = el.textContent.trim();

        if (textContent.length > 10) { // Only check elements with substantial text
          // Check minimum font size
          if (fontSize < 14) {
            issues.push({
              type: 'Small font size',
              element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
              fontSize: fontSize + 'px',
              text: textContent.substring(0, 50) + '...'
            });
          }

          // Check line height for readability
          if (lineHeight && lineHeight < 1.2) {
            issues.push({
              type: 'Poor line height',
              element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
              lineHeight: lineHeight,
              text: textContent.substring(0, 50) + '...'
            });
          }
        }
      });

      // Check color contrast (basic check)
      const colorElements = document.querySelectorAll('*');
      colorElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const backgroundColor = style.backgroundColor;

        // Check for very light text on light backgrounds
        if (color.includes('rgb(') && backgroundColor.includes('rgb(')) {
          // This is a simplified contrast check - would need more sophisticated color analysis
          const textColor = color.match(/\d+/g);
          const bgColor = backgroundColor.match(/\d+/g);

          if (textColor && bgColor) {
            const textLuminance = (parseInt(textColor[0]) + parseInt(textColor[1]) + parseInt(textColor[2])) / 3;
            const bgLuminance = (parseInt(bgColor[0]) + parseInt(bgColor[1]) + parseInt(bgColor[2])) / 3;

            if (Math.abs(textLuminance - bgLuminance) < 50) {
              issues.push({
                type: 'Poor color contrast',
                element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
                textColor: color,
                backgroundColor: backgroundColor
              });
            }
          }
        }
      });

      return issues;
    });

    readabilityIssues.forEach(issue => {
      let severity = 'MEDIUM';
      if (issue.type === 'Small font size' || issue.type === 'Poor color contrast') {
        severity = 'HIGH';
      }

      this.addIssue(
        pageName,
        'Content Readability',
        severity,
        `${issue.type}: ${issue.element} - ${issue.fontSize || issue.lineHeight || issue.textColor}`
      );
    });
  }

  // Check interactive elements (touch targets)
  async checkInteractiveElements(page, pageName) {
    console.log(`\n👆 CHECKING INTERACTIVE ELEMENTS: ${pageName}`);

    const touchTargetIssues = await page.evaluate(() => {
      const issues = [];
      const minTouchTarget = 44; // 44px minimum recommended by Apple/Google

      const interactiveElements = document.querySelectorAll(
        'button, a, input, select, textarea, [onclick], [role="button"], .btn'
      );

      interactiveElements.forEach(el => {
        const rect = el.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) { // Only check visible elements
          if (rect.width < minTouchTarget || rect.height < minTouchTarget) {
            issues.push({
              element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              text: el.textContent ? el.textContent.trim().substring(0, 30) : el.type || 'Interactive element'
            });
          }
        }
      });

      return issues;
    });

    touchTargetIssues.forEach(issue => {
      this.addIssue(
        pageName,
        'Interactive Elements',
        'HIGH',
        `Touch target too small: ${issue.element} (${issue.width}x${issue.height}px, should be 44x44px minimum) - "${issue.text}"`
      );
    });

    // Check form usability
    const formIssues = await page.evaluate(() => {
      const issues = [];
      const forms = document.querySelectorAll('form');

      forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
          const rect = input.getBoundingClientRect();
          const style = window.getComputedStyle(input);

          // Check input size
          if (rect.height < 40) {
            issues.push({
              type: 'Input too small',
              element: `${input.tagName}[type="${input.type}"]`,
              height: Math.round(rect.height)
            });
          }

          // Check label association
          const label = form.querySelector(`label[for="${input.id}"]`) ||
                       input.closest('label') ||
                       form.querySelector('label');

          if (!label && input.type !== 'hidden' && input.type !== 'submit') {
            issues.push({
              type: 'Missing label',
              element: `${input.tagName}[type="${input.type}"]`,
              placeholder: input.placeholder || 'No placeholder'
            });
          }
        });
      });

      return issues;
    });

    formIssues.forEach(issue => {
      this.addIssue(
        pageName,
        'Interactive Elements',
        issue.type === 'Missing label' ? 'MEDIUM' : 'HIGH',
        `Form issue - ${issue.type}: ${issue.element} (${issue.height ? issue.height + 'px height' : issue.placeholder})`
      );
    });
  }

  // Check visual hierarchy
  async checkVisualHierarchy(page, pageName) {
    console.log(`\n🎨 CHECKING VISUAL HIERARCHY: ${pageName}`);

    const hierarchyIssues = await page.evaluate(() => {
      const issues = [];

      // Check heading order
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;

      headings.forEach(heading => {
        const level = parseInt(heading.tagName.substring(1));

        if (level > lastLevel + 1) {
          issues.push({
            type: 'Heading order skip',
            element: heading.tagName,
            text: heading.textContent.trim().substring(0, 50),
            previousLevel: lastLevel,
            currentLevel: level
          });
        }

        lastLevel = level;
      });

      // Check for proper spacing between sections
      const sections = document.querySelectorAll('section, .section, main > div');
      sections.forEach((section, index) => {
        if (index > 0) {
          const rect = section.getBoundingClientRect();
          const prevSection = sections[index - 1];
          const prevRect = prevSection.getBoundingClientRect();

          const gap = rect.top - prevRect.bottom;

          if (gap < 20) { // Less than 20px gap between sections
            issues.push({
              type: 'Insufficient section spacing',
              section: `Section ${index + 1}`,
              gap: Math.round(gap) + 'px'
            });
          }
        }
      });

      return issues;
    });

    hierarchyIssues.forEach(issue => {
      this.addIssue(
        pageName,
        'Visual Hierarchy',
        issue.type === 'Heading order skip' ? 'MEDIUM' : 'HIGH',
        `${issue.type}: ${issue.element || issue.section} - ${issue.text || issue.gap}`
      );
    });
  }

  // Check for technical issues
  async checkTechnicalIssues(page, pageName) {
    console.log(`\n⚡ CHECKING TECHNICAL ISSUES: ${pageName}`);

    // Check for horizontal scrolling
    const scrollIssues = await page.evaluate(() => {
      const issues = [];

      // Check if page has horizontal scroll
      if (document.documentElement.scrollWidth > window.innerWidth) {
        issues.push({
          type: 'Horizontal scroll detected',
          pageWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
          overflow: document.documentElement.scrollWidth - window.innerWidth
        });
      }

      // Check for elements causing overflow
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();

        if (rect.right > window.innerWidth + 5) { // 5px tolerance
          issues.push({
            type: 'Element overflow',
            element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
            width: Math.round(rect.width),
            right: Math.round(rect.right),
            viewportWidth: window.innerWidth
          });
        }
      });

      return issues;
    });

    scrollIssues.forEach(issue => {
      this.addIssue(
        pageName,
        'Technical Issues',
        'CRITICAL',
        `${issue.type}: ${issue.element || 'Page'} - ${issue.overflow ? 'Overflow: ' + issue.overflow + 'px' : 'Width: ' + issue.width + 'px, viewport: ' + issue.viewportWidth + 'px'}`
      );
    });

    // Check console errors
    const consoleErrors = await page.evaluate(() => {
      return window.mobileAuditErrors || [];
    });

    // Capture console errors during page load
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => {
        this.addIssue(
          pageName,
          'Technical Issues',
          'MEDIUM',
          `JavaScript error: ${error}`
        );
      });
    }
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n📊 GENERATING COMPREHENSIVE MOBILE AUDIT REPORT...');

    // Categorize issues by severity
    const critical = this.issues.filter(i => i.severity === 'CRITICAL');
    const high = this.issues.filter(i => i.severity === 'HIGH');
    const medium = this.issues.filter(i => i.severity === 'MEDIUM');
    const low = this.issues.filter(i => i.severity === 'LOW');

    this.auditReport.summary = {
      totalIssues: this.issues.length,
      critical: critical.length,
      high: high.length,
      medium: medium.length,
      low: low.length,
      readyForClient: critical.length === 0 && high.length < 3
    };

    // Generate recommendations
    this.auditReport.recommendations = [
      {
        priority: 'IMMEDIATE',
        title: 'Fix Critical Mobile Padding Issues',
        description: 'Add minimum 15px horizontal padding to all container elements on mobile',
        impact: 'Professional appearance, client presentation readiness',
        files: ['wp-content/themes/historic-equity/static/scss/_layout.scss', 'wp-content/themes/historic-equity/static/scss/_responsive.scss']
      },
      {
        priority: 'IMMEDIATE',
        title: 'Eliminate Horizontal Scrolling',
        description: 'Fix elements causing horizontal overflow on mobile viewports',
        impact: 'Core user experience, mobile usability',
        files: ['Various template files and CSS']
      },
      {
        priority: 'BEFORE-CLIENT',
        title: 'Optimize Touch Targets',
        description: 'Ensure all interactive elements meet 44px minimum touch target size',
        impact: 'Mobile usability, accessibility compliance',
        files: ['wp-content/themes/historic-equity/static/scss/_components.scss']
      }
    ];

    return this.auditReport;
  }

  // Save report to file
  saveReport() {
    const reportPath = path.join(__dirname, 'mobile-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.auditReport, null, 2));

    // Generate human-readable summary
    const summary = this.generateHumanReadableSummary();
    const summaryPath = path.join(__dirname, 'mobile-audit-summary.md');
    fs.writeFileSync(summaryPath, summary);

    console.log(`\n📝 Reports saved:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   Summary: ${summaryPath}`);

    return { reportPath, summaryPath };
  }

  // Generate human-readable summary
  generateHumanReadableSummary() {
    const { summary } = this.auditReport;
    const critical = this.issues.filter(i => i.severity === 'CRITICAL');
    const high = this.issues.filter(i => i.severity === 'HIGH');

    let markdown = `# MOBILE UI/UX AUDIT REPORT - Historic Equity Inc.
**URGENT: Client Presentation Tomorrow**

## Executive Summary
- **Total Issues Found:** ${summary.totalIssues}
- **Critical Issues:** ${summary.critical} (Must fix before presentation)
- **High Priority Issues:** ${summary.high}
- **Client Ready Status:** ${summary.readyForClient ? '✅ READY' : '❌ NEEDS WORK'}

## Critical Issues Requiring Immediate Attention

`;

    critical.forEach((issue, index) => {
      markdown += `### ${index + 1}. ${issue.description}
- **Page:** ${issue.page}
- **Category:** ${issue.category}
- **Impact:** ${SEVERITY[issue.severity]}

`;
    });

    markdown += `## High Priority Issues

`;

    high.forEach((issue, index) => {
      markdown += `### ${index + 1}. ${issue.description}
- **Page:** ${issue.page}
- **Category:** ${issue.category}

`;
    });

    markdown += `## Immediate Action Plan for Tomorrow's Presentation

`;

    this.auditReport.recommendations.forEach((rec, index) => {
      markdown += `### ${index + 1}. ${rec.title} (${rec.priority})
${rec.description}

**Impact:** ${rec.impact}
**Files to modify:** ${rec.files.join(', ')}

`;
    });

    markdown += `## Next Steps
1. Fix all CRITICAL issues immediately
2. Address HIGH priority issues if time permits
3. Test on actual mobile devices before presentation
4. Capture screenshots showing improvements

**Report generated:** ${new Date().toLocaleString()}
`;

    return markdown;
  }
}

module.exports = { MobileAudit, config };