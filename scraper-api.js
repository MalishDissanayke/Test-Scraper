const axios = require('axios');
const fs    = require('fs');

async function scrapeMatches() {
  // Real values observed in the browser’s Network tab:
  const SUB1   = '14t2n34f8hpef';
  const AMOUNT = '1';

  const url =
    'https://1wywg.com/v3/3991/landing-betting-india'
    + `?lang=en&bonus=hi&subid=${SUB1}&payout=${AMOUNT}`
    + `&p=zgpn&sub1=${SUB1}`;

  try {
    console.log(`⏳ Fetching JSON from:\n  ${url}`);
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/120 Safari/537.36'
      },
      timeout: 60000
    });

    // Dump full payload for inspection
    fs.writeFileSync('debug.json', JSON.stringify(data, null, 2));
    console.log('📦 Raw payload saved to debug.json');

    // The actual arrays may live directly on data, or under data.data
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
