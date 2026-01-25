const axios = require('axios');

const contestId = '784080';
const cookies = 'JSESSIONID=4XFJFH68MK67LBIDDVNGXGB3FW48GSZ9; JSESSIONID=naitikchattaraj|CA14EX28TFXFHNZJMN8W5QK6HIIA0N';

async function check() {
    try {
        const res = await axios.get(`https://vjudge.net/contest/rank/single/${contestId}`, {
            headers: {
                'Cookie': cookies,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        console.log('Participants structure:');
        const participants = res.data.participants || {};
        const firstKey = Object.keys(participants)[0];
        if (firstKey) {
            console.log(`User ID: ${firstKey}`);
            console.log(`Data:`, participants[firstKey]);
            console.log(`Data type:`, typeof participants[firstKey]);
            if (Array.isArray(participants[firstKey])) {
                console.log(`Array length:`, participants[firstKey].length);
                console.log(`Array contents:`, participants[firstKey]);
            }
        }

    } catch (e) {
        console.log('Error:', e.message);
    }
}

check();
