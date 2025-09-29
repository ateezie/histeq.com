const { chromium } = require('playwright');
const http = require('http');
const url = require('url');

let browser;
let page;

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = url.parse(req.url, true);

    if (reqUrl.pathname === '/goto') {
      const targetUrl = reqUrl.query.url;
      if (targetUrl) {
        const response = await page.goto(targetUrl);
        if (response) {
          const content = await response.text();
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Navigation failed');
        }
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing url query parameter');
      }
    } else if (reqUrl.pathname === '/screenshot') {
      const screenshotPath = 'screenshots/gemini-view.png';
      await page.screenshot({ path: screenshotPath });
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`Screenshot saved to ${screenshotPath}`);
    } else if (reqUrl.pathname === '/actions') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const actions = JSON.parse(body);
          for (const action of actions) {
            const { action: actionName, args } = action;
            if (page[actionName]) {
              await page[actionName](...args);
            } else {
              throw new Error(`Unknown action: ${actionName}`);
            }
          }
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Actions executed successfully');
        } catch (error) {
          console.error('Error executing actions:', error);
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end(`Error executing actions: ${error.message}`);
        }
      });
    } else if (reqUrl.pathname === '/close') {
      await browser.close();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Browser closed');
      server.close();
    } else if (reqUrl.pathname === '/get-style') {
      const selector = reqUrl.query.selector;
      if (selector) {
        const styles = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (!element) return { error: `Element ${selector} not found` };
          const computedStyles = window.getComputedStyle(element);
          return {
            paddingTop: computedStyles.paddingTop,
            paddingBottom: computedStyles.paddingBottom,
          };
        }, selector);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(styles));
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing selector query parameter');
      }
    } else if (reqUrl.pathname === '/get-element-details') {
      const selector = reqUrl.query.selector;
      if (selector) {
        const details = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (!element) return { error: `Element ${selector} not found` };
          const computedStyles = window.getComputedStyle(element);
          const styles = {};
          for (let i = 0; i < computedStyles.length; i++) {
            const prop = computedStyles[i];
            styles[prop] = computedStyles.getPropertyValue(prop);
          }
          return {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            styles: styles,
          };
        }, selector);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(details));
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing selector query parameter');
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } catch (error) {
    console.error('Unhandled error in server request:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Internal Server Error: ${error.message}`);
  }
});

(async () => {
  browser = await chromium.launch();
  page = await browser.newPage();
  const port = 8052;
  server.listen(port, () => {
    console.log(`Playwright MCP server listening on http://localhost:${port}`);
  });
})();

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing browser and exiting.');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing browser and exiting.');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});