const axios = require('axios');

const contestId = '684234';

async function check() {
    try {
        const res = await axios.get('https://vjudge.net/contest/' + contestId, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = res.data;

        // Find all problem identifiers in links
        const matches = html.match(/#problem\/([A-Z]+)/g);
        if (matches) {
            const problems = [...new Set(matches.map(m => m.split('/')[1]))].sort();
            console.log('Found problems:', problems);
        } else {
            console.log('No problem links found.');
        }

    } catch (e) {
        console.log('Error:', e.message);
    }
}

check();
