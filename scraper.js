const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// Function to determine if we are in a GitHub Actions environment
const isGithubCI = process.env.GITHUB_ACTIONS === 'true';

// Set the correct executable path based on the environment
const executablePath = isGithubCI
  ? '/usr/bin/google-chrome-stable'  // Path to Chromium for GitHub Actions
  : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';  // Local machine path

async function scrapeMatches() {
  let browser;
  let page;
  try {
    console.log('⏳ Navigating to page...');

    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: true,  // Set to false if you want to see the browser
      executablePath,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage'
      ]
    });

    page = await browser.newPage();

    // Set a custom user-agent to avoid detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
    );

    const url = 'https://1wywg.com/v3/3991/landing-betting-india?lang=en&bonus=hi&subid={sub1}&payout={amount}&p=zgpn&sub1=14t2n34f8hpef';

    // Navigate to the page and wait for .calendar-card to load
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('✅ Page loaded. Waiting for .calendar-card...');
    
    // Wait for .calendar-card elements to be available in the DOM
    await page.waitForSelector('.calendar-card', { timeout: 30000 });

    console.log('✅ Found .calendar-card elements');

    // Scraping prematch data
    console.log('🔍 Scraping prematch data...');
    const prematchData = await page.evaluate(() => {
      const matches = [];
      document.querySelectorAll('.calendar-card').forEach(card => {
        const date = card.querySelector('.calendar-card__date')?.innerText.trim() || '';
        const title = card.querySelector('.calendar-card__title')?.innerText.trim() || '';
        const bets = [];
        card.querySelectorAll('.calendar-card__bet-item').forEach(bet => {
          const team = bet.querySelector('.calendar-card__bet-name')?.innerText.trim() || '';
          const odds = bet.querySelector('.calendar-card__bet-coef')?.innerText.trim() || '';
          bets.push({ team, odds });
        });
        if (title && bets.length) matches.push({ date, title, bets });
      });
      return matches;
    });

    // Save prematch data to file
    fs.writeFileSync('prematch.json', JSON.stringify(prematchData, null, 2));
    console.log('✅ Saved prematch.json');

    // Click the 'Live' tab to switch to live data
    await page.evaluate(() => {
      const liveTab = document.querySelector('.calendar-switcher__item:nth-child(2)');
      if (liveTab) liveTab.click();
    });

    console.log('⏳ Waiting after switching tab...');
    
    // Instead of waitForTimeout, use waitForSelector for the live content to load
    await page.waitForSelector('.calendar-card', { timeout: 30000 });  // Waiting for the live tab's calendar cards

    // Scraping live data
    console.log('🔍 Scraping live data...');
    const liveData = await page.evaluate(() => {
      const matches = [];
      document.querySelectorAll('.calendar-card').forEach(card => {
        const date = card.querySelector('.calendar-card__date')?.innerText.trim() || '';
        const title = card.querySelector('.calendar-card__title')?.innerText.trim() || '';
        const bets = [];
        card.querySelectorAll('.calendar-card__bet-item').forEach(bet => {
          const team = bet.querySelector('.calendar-card__bet-name')?.innerText.trim() || '';
          const odds = bet.querySelector('.calendar-card__bet-coef')?.innerText.trim() || '';
          bets.push({ team, odds });
        });
        if (title && bets.length) matches.push({ date, title, bets });
      });
      return matches;
    });

    // Save live data to file
    fs.writeFileSync('live.json', JSON.stringify(liveData, null, 2));
    console.log('✅ Saved live.json');

  } catch (err) {
    console.error('❌ Scraping error:', err.message);

    // If an error occurs, capture the debug HTML and screenshot
    try {
      if (page) {
        fs.writeFileSync('debug.html', await page.content());
        await page.screenshot({ path: 'final-screenshot.png' });
        console.log('🧾 Saved final screenshot and debug.html');
      }
    } catch (e) {
      console.error('⚠️ Could not save debug info:', e.message);
    }

  } finally {
    // Close the browser
    if (browser) {
      await browser.close();
    }
  }
}

scrapeMatches();
