const axios = require('axios');
const fs = require('fs');

async function scrapeMatches() {
  const url =
    'https://1wywg.com/v3/3991/landing-betting-india'
    + '?lang=en&bonus=hi&subid={sub1}&payout={amount}'
    + '&p=zgpn&sub1=14t2n34f8hpef';

  try {
    console.log('⏳ Fetching JSON from API endpoint…');
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                      'Chrome/120 Safari/537.36'
      },
      timeout: 60000
    });

    // The structure may vary; inspect `data` in your console/logs
    console.log('✅ Received payload keys:', Object.keys(data));

    // Usually the API returns something like { prematch: [...], live: [...], ... }
    const prematch = data.prematch || data.data?.prematch || [];
    const live     = data.live     || data.data?.live     || [];

    fs.writeFileSync('prematch.json', JSON.stringify(prematch, null, 2));
    fs.writeFileSync('live.json',     JSON.stringify(live,     null, 2));
    console.log('✅ Saved prematch.json & live.json');

  } catch (err) {
    console.error('❌ Fetch error:', err.message);
    process.exit(1);
  }
}

scrapeMatches();
