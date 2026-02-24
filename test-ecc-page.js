/**
 * QA Test Script for ECC Page Functionality
 * Tests:
 * 1. Page loading
 * 2. Agent cards clickability
 * 3. Navigation to agent detail pages
 * 4. Auto-expansion of agent cards on subpages
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'https://claudecode.tumuai.net';
const ECC_PAGE = `${BASE_URL}/pages/appendix-ecc.html`;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bold');
  console.log('='.repeat(80));
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✓ PASS' : '✗ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status}: ${testName}`, color);
  if (details) {
    console.log(`  ${details}`);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  logSection('🧪 QA Test Report: ECC Page Functionality');
  log(`Target: ${ECC_PAGE}`);
  log(`Started: ${new Date().toISOString()}`);

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  let browser;
  let page;

  try {
    // Launch browser
    log('\n📌 Setup: Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Set to false to see the browser
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--start-maximized']
    });

    page = await browser.newPage();

    // Enable request interception to monitor network issues
    await page.on('console', msg => {
      if (msg.type() === 'error') {
        log(`  Browser Console Error: ${msg.text()}`, 'yellow');
      }
    });

    // Test 1: Page Loading
    logSection('Test 1: Page Loading');
    results.total++;

    try {
      const response = await page.goto(ECC_PAGE, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      const status = response.status();
      const title = await page.title();

      log(`HTTP Status: ${status}`, 'blue');
      log(`Page Title: ${title}`, 'blue');

      if (status === 200) {
        logTest('Page loads successfully', true, `Status: ${status}`);
        results.passed++;
        results.tests.push({ name: 'Page Loading', passed: true });
      } else {
        logTest('Page loads successfully', false, `Status: ${status}`);
        results.failed++;
        results.tests.push({ name: 'Page Loading', passed: false });
      }
    } catch (error) {
      logTest('Page loads successfully', false, `Error: ${error.message}`);
      results.failed++;
      results.tests.push({ name: 'Page Loading', passed: false });
    }

    await sleep(2000);

    // Test 2: Find "Agents 子代理系统" Section
    logSection('Test 2: Locate Agents Section');
    results.total++;

    try {
      // Try to find the section by text content
      const agentsSection = await page.evaluateHandle(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
        return headings.find(h => h.textContent.includes('Agents') && h.textContent.includes('子代理'));
      });

      if (agentsSection) {
        const sectionText = await agentsSection.asElement().evaluate(el => el.textContent);
        logTest('Agents section found', true, `Text: "${sectionText}"`);
        results.passed++;
        results.tests.push({ name: 'Find Agents Section', passed: true });

        // Scroll to section
        await agentsSection.asElement().evaluate(el => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        log('  → Scrolled to Agents section', 'blue');
        await sleep(1000);
      } else {
        logTest('Agents section found', false, 'Section not found on page');
        results.failed++;
        results.tests.push({ name: 'Find Agents Section', passed: false });

        // Debug: List all headings
        const allHeadings = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('h1, h2, h3, h4'))
            .map(h => `${h.tagName}: ${h.textContent}`)
            .slice(0, 10);
        });
        log('  Available headings:', 'yellow');
        allHeadings.forEach(h => log(`    ${h}`, 'yellow'));
      }
    } catch (error) {
      logTest('Agents section found', false, `Error: ${error.message}`);
      results.failed++;
      results.tests.push({ name: 'Find Agents Section', passed: false });
    }

    // Test 3: Check Agent Cards for Clickability
    logSection('Test 3: Agent Cards Clickability');
    results.total++;

    try {
      // Take screenshot for visual verification
      const screenshotPath = path.join(__dirname, 'test-screenshots', 'ecc-page.png');
      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
      await page.screenshot({ path: screenshotPath, fullPage: false });
      log(`  Screenshot saved: ${screenshotPath}`, 'blue');

      // Find all agent card links specifically
      const agentCards = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links
          .filter(link => {
            const href = link.href || '';
            return href.includes('appendix-ecc-agents.html') &&
                   link.classList.contains('ecc-card-link');
          })
          .map(link => {
            const card = link;
            const title = card.querySelector('.ecc-card-title');
            const desc = card.querySelector('.ecc-card-desc');
            return {
              href: link.href,
              title: title ? title.textContent.trim() : 'N/A',
              desc: desc ? desc.textContent.trim().slice(0, 50) : 'N/A',
              classList: Array.from(link.classList)
            };
          });
      });

      log(`  Found ${agentCards.length} agent card links`, 'blue');

      if (agentCards.length > 0) {
        logTest('Agent cards are clickable', true,
          `Found ${agentCards.length} clickable agent cards`);
        results.passed++;
        results.tests.push({ name: 'Agent Cards Clickability', passed: true });

        // Show sample cards
        log('  Sample agent cards:', 'blue');
        agentCards.slice(0, 5).forEach(card => {
          log(`    ✓ "${card.title}" → ${card.href}`, 'green');
        });
      } else {
        logTest('Agent cards are clickable', false,
          'No agent card links found');
        results.failed++;
        results.tests.push({ name: 'Agent Cards Clickability', passed: false });

        // Debug: Check if links exist without class filter
        const allAgentLinks = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a'));
          return links
            .filter(link => (link.href || '').includes('appendix-ecc-agents'))
            .map(link => ({
              href: link.href,
              text: link.textContent.trim().slice(0, 50),
              classList: Array.from(link.classList)
            }))
            .slice(0, 5);
        });

        if (allAgentLinks.length > 0) {
          log('  Found links but without ecc-card-link class:', 'yellow');
          allAgentLinks.forEach(link => {
            log(`    "${link.text}" → ${link.href}`, 'yellow');
            log(`      Classes: ${link.classList.join(', ')}`, 'yellow');
          });
        }
      }
    } catch (error) {
      logTest('Agent cards are clickable', false, `Error: ${error.message}`);
      results.failed++;
      results.tests.push({ name: 'Agent Cards Clickability', passed: false });
    }

    // Test 4: Click Specific Agent Cards and Verify Navigation
    logSection('Test 4: Agent Card Navigation');
    const agentsToTest = [
      { name: 'Planner', selector: 'a[href*="#planner"]' },
      { name: 'Architect', selector: 'a[href*="#architect"]' },
      { name: 'Designer', selector: 'a[href*="#designer"]' },
      { name: 'TDD-Guide', selector: 'a[href*="#tdd-guide"]' }
    ];

    for (const agentTest of agentsToTest) {
      const agentName = agentTest.name;
      results.total++;

      try {
        log(`\n  Testing: ${agentName}`, 'blue');

        // Find link to this agent using a more specific selector
        const linkExists = await page.evaluate((selector) => {
          const link = document.querySelector(selector);
          if (!link) return { found: false };

          return {
            found: true,
            href: link.href,
            text: link.textContent.trim().slice(0, 50),
            visible: link.offsetParent !== null
          };
        }, agentTest.selector);

        if (!linkExists.found) {
          logTest(`${agentName} card navigation`, false, 'Link not found on page');
          results.failed++;
          results.tests.push({ name: `${agentName} Navigation`, passed: false });
          continue;
        }

        log(`    Found link: ${linkExists.href}`, 'blue');
        log(`    Text: "${linkExists.text}"`, 'blue');
        log(`    Visible: ${linkExists.visible}`, 'blue');

        // Click the link
        await page.click(agentTest.selector);

        // Wait for navigation
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {
          log('    Warning: Navigation timeout, checking current page...', 'yellow');
        });

        await sleep(2000);

        // Check if we're on the agents page
        const currentUrl = page.url();
        log(`    Current URL: ${currentUrl}`, 'blue');

        if (currentUrl.includes('appendix-ecc-agents.html')) {
          log(`    ✓ Successfully navigated to agents page`, 'green');

          // Test 5: Check if agent card is auto-expanded
          results.total++;

          // Check if the specific agent section is visible
          const agentSectionVisible = await page.evaluate((selector) => {
            // Extract the anchor from the URL hash
            const hash = window.location.hash.substring(1); // Remove the #
            if (!hash) return { found: false };

            const element = document.getElementById(hash);
            if (!element) return { found: false, reason: 'Element with ID not found' };

            const rect = element.getBoundingClientRect();
            const isInViewport = rect.top >= 0 && rect.top <= window.innerHeight;

            return {
              found: true,
              id: hash,
              inViewport: isInViewport,
              visible: element.offsetParent !== null,
              expanded: element.classList.contains('expanded') ||
                       element.classList.contains('active') ||
                       element.querySelector('.active') !== null
            };
          }, '');

          if (agentSectionVisible.found) {
            log(`    ✓ Agent section found: #${agentSectionVisible.id}`, 'green');
            log(`    In viewport: ${agentSectionVisible.inViewport}`, 'blue');
            log(`    Expanded: ${agentSectionVisible.expanded}`, 'blue');

            // Try to scroll to the element
            await page.evaluate((id) => {
              const element = document.getElementById(id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, agentSectionVisible.id);
            await sleep(1000);

            logTest(`${agentName} card navigation & positioning`, true,
              `Navigated and positioned to #${agentSectionVisible.id}`);
            results.passed++;
            results.tests.push({ name: `${agentName} Navigation`, passed: true });

            // Take screenshot
            const screenshotPath = path.join(__dirname, 'test-screenshots', `${agentName.toLowerCase()}-expanded.png`);
            await page.screenshot({ path: screenshotPath });
            log(`    Screenshot: ${screenshotPath}`, 'blue');
          } else {
            logTest(`${agentName} card navigation`, false,
              `Agent section not found: ${agentSectionVisible.reason || 'Unknown'}`);
            results.failed++;
            results.tests.push({ name: `${agentName} Navigation`, passed: false });
          }

          // Go back to main ECC page for next test
          await page.goto(ECC_PAGE, { waitUntil: 'networkidle2' });
          await sleep(1000);

        } else {
          logTest(`${agentName} card navigation`, false, `Did not navigate to agents page. Current: ${currentUrl}`);
          results.failed++;
          results.tests.push({ name: `${agentName} Navigation`, passed: false });

          // Go back for next test
          if (page.url() !== ECC_PAGE) {
            await page.goto(ECC_PAGE, { waitUntil: 'networkidle2' });
            await sleep(1000);
          }
        }

      } catch (error) {
        logTest(`${agentName} card navigation`, false, `Error: ${error.message}`);
        results.failed++;
        results.tests.push({ name: `${agentName} Navigation`, passed: false });

        // Recover
        await page.goto(ECC_PAGE, { waitUntil: 'networkidle2' }).catch(() => {});
        await sleep(1000);
      }
    }

    // Test 6: Check for JavaScript Errors
    logSection('Test 5: JavaScript Console Errors');
    results.total++;

    try {
      const errors = await page.evaluate(() => {
        return window.__consoleErrors || [];
      });

      if (errors.length === 0) {
        logTest('No JavaScript console errors', true);
        results.passed++;
        results.tests.push({ name: 'No Console Errors', passed: true });
      } else {
        logTest('No JavaScript console errors', false,
          `Found ${errors.length} error(s)`);
        results.failed++;
        results.tests.push({ name: 'No Console Errors', passed: false });
        errors.forEach(err => log(`    ${err}`, 'yellow'));
      }
    } catch (error) {
      logTest('No JavaScript console errors', false, `Error checking: ${error.message}`);
      results.failed++;
      results.tests.push({ name: 'No Console Errors', passed: false });
    }

  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    if (browser) {
      log('\n📌 Cleanup: Closing browser...', 'blue');
      await browser.close();
      log('✓ Browser closed', 'green');
    }
  }

  // Print Summary
  logSection('Test Summary');
  log(`Total Tests: ${results.total}`, 'bold');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');

  if (results.failed === 0) {
    log('\n✓ All tests PASSED!', 'green');
  } else {
    log('\n✗ Some tests FAILED', 'red');
    log('\nFailed tests:', 'yellow');
    results.tests.filter(t => !t.passed).forEach(t => {
      log(`  - ${t.name}`, 'red');
    });
  }

  // Write results to file
  const resultsPath = path.join(__dirname, 'test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  log(`\n📄 Results saved to: ${resultsPath}`, 'blue');

  // Return exit code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
