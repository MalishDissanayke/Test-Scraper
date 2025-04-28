const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeMatches() {
  const url = 'https://1wywg.com/v3/3991/landing-betting-india?lang=en&bonus=hi&subid={sub1}&payout={amount}&p=zgpn&sub1=14t2n34f8hpef';

  try {
    console.log('⏳ Fetching page HTML…');
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                      'Chrome/120 Safari/537.36'
      },
      timeout: 60000
    });

    console.log('✅ HTML fetched. Parsing…');
    const $ = cheerio.load(html);
    const cards = $('.calendar-table__items .calendar-card');
    const half = Math.ceil(cards.length / 2);
    const prematch = [], live = [];

    cards.each((i, el) => {
      const $card = $(el);
      const date  = $card.find('.calendar-card__date').text().trim();
      const title = $card.find('.calendar-card__title').text().trim();
      const bets  = $card.find('.calendar-card__bet-item').map((j, b) => {
        const $b = $(b);
        return {
          team: $b.find('.calendar-card__bet-name').text().trim(),
          odds: $b.find('.calendar-card__bet-coef').text().trim(),
        };
      }).get();

      if (title && bets.length) {
        if (i < half) prematch.push({ date, title, bets });
        else         live.push({ date, title, bets });
      }
    });

    fs.writeFileSync('prematch.json', JSON.stringify(prematch, null, 2));
    fs.writeFileSync('live.json',     JSON.stringify(live,     null, 2));
    console.log('✅ Saved prematch.json & live.json');
  } catch (err) {
    console.error('❌ Scraping error:', err.message);
    process.exit(1);
  }
}

scrapeMatches();
