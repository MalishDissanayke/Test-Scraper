const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  let browser;
  let page;
  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();

    // Use a realistic user-agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/120 Safari/537.36'
    );

    const url = 'https://1wywg.com/v3/3991/landing-betting-india?lang=en&bonus=hi&subid={sub1}&payout={amount}&p=zgpn&sub1=14t2n34f8hpef';

    console.log('⏳ Navigating to page...');
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    console.log('✅ Page loaded. Waiting for .calendar-card...');
    await page.waitForSelector('.calendar-card', { timeout: 180000 });

    console.log('🔍 Scraping prematch data...');
    const prematchData = await page.$$eval('.calendar-card', cards =>
      cards.map(card => {
        const date  = card.querySelector('.calendar-card__date')?.innerText.trim()  || '';
        const title = card.querySelector('.calendar-card__title')?.innerText.trim() || '';
        const bets  = Array.from(card.querySelectorAll('.calendar-card__bet-item'), bet => ({
          team: bet.querySelector('.calendar-card__bet-name')?.innerText.trim() || '',
          odds: bet.querySelector('.calendar-card__bet-coef')?.innerText.trim() || ''
        }));
        return title && bets.length ? { date, title, bets } : null;
      }).filter(Boolean)
    );
    fs.writeFileSync('prematch.json', JSON.stringify(prematchData, null, 2));
    console.log('✅ Saved prematch.json');

    console.log('🖱️ Clicking Live tab...');
    await page.click('.calendar-switcher__item:nth-child(2)');
    await page.waitForTimeout(5000);

    console.log('🔍 Scraping live data...');
    const liveData = await page.$$eval('.calendar-card', cards =>
      cards.map(card => {
        const date  = card.querySelector('.calendar-card__date')?.innerText.trim()  || '';
        const title = card.querySelector('.calendar-card__title')?.innerText.trim() || '';
        const bets  = Array.from(card.querySelectorAll('.calendar-card__bet-item'), bet => ({
          team: bet.querySelector('.calendar-card__bet-name')?.innerText.trim() || '',
          odds: bet.querySelector('.calendar-card__bet-coef')?.innerText.trim() || ''
        }));
        return title && bets.length ? { date, title, bets } : null;
      }).filter(Boolean)
    );
    fs.writeFileSync('live.json', JSON.stringify(liveData, null, 2));
    console.log('✅ Saved live.json');

  } catch (err) {
    console.error('❌ Scraping error:', err.message);
    try {
      if (page) {
        fs.writeFileSync('debug.html', await page.content());
        await page.screenshot({ path: 'final-screenshot.png' });
        console.log('🧾 Saved debug.html and final-screenshot.png');
      }
    } catch (e) {
      console.error('⚠️ Could not save debug info:', e.message);
    }
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
