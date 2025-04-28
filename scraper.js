const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeMatches() {
  let browser;
  try {
    console.log('⏳ Navigating to page...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set a custom user-agent to avoid detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
    );

    const url = 'https://1wywg.com/v3/3991/landing-betting-india?lang=en&bonus=hi&subid={sub1}&payout={amount}&p=zgpn&sub1=14t2n34f8hpef';

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('✅ Page loaded. Waiting for .calendar-card elements...');
    // Use waitForSelector() to wait for the .calendar-card elements
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

    fs.writeFileSync('prematch.json', JSON.stringify(prematchData, null, 2));
    console.log('✅ Saved prematch.json');

    // Click Live tab to switch
    await page.evaluate(() => {
      const liveTab = document.querySelector('.calendar-switcher__item:nth-child(2)');
      if (liveTab) liveTab.click();
    });

    console.log('⏳ Waiting after switching tab...');
    // Wait for the .calendar-card elements again after switching tabs
    await page.waitForSelector('.calendar-card', { timeout: 30000 });

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

    fs.writeFileSync('live.json', JSON.stringify(liveData, null, 2));
    console.log('✅ Saved live.json');

  } catch (err) {
    console.error('❌ Scraping error:', err.message);

    // Save debug info if something goes wrong
    try {
      const page = await browser.newPage();
      fs.writeFileSync('debug.html', await page.content());
      await page.screenshot({ path: 'final-screenshot.png' });
      console.log('🧾 Saved final screenshot and debug.html');
    } catch (e) {
      console.error('⚠️ Could not save debug info:', e.message);
    }
  } finally {
    // Ensure that the browser is closed properly
    if (browser) {
      await browser.close();
    }
  }
}

// Execute the scraper function
scrapeMatches();
