const axios = require('axios');

const contestId = '784080';
const cookies = 'JSESSIONID=4XFJFH68MK67LBIDDVNGXGB3FW48GSZ9; JSESSIONID=naitikchattaraj|CA14EX28TFXFHNZJMN8W5QK6HIIA0N';

async function check() {
    try {
        const res = await axios.get(`https://vjudge.net/problem/data`, {
            params: {
                draw: 1,
                start: 0,
                length: 100,
                contestId: contestId
            },
            headers: {
                'Cookie': cookies,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        console.log('Response:');
        console.log(JSON.stringify(res.data, null, 2));

        if (res.data.data && res.data.data.length > 0) {
            console.log('\n✓ Found problems!');
            res.data.data.forEach(p => {
                console.log(`Problem ${p[0]}: ${p[2]}`);
            });
        }

    } catch (e) {
        console.log('Error:', e.response?.status || e.message);
    }
}

check();
