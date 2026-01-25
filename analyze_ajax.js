const axios = require('axios');
const fs = require('fs');

const contestId = '784080';
const cookies = 'JSESSlONID=4XFJFH68MK67LBIDDVNGXGB3FW48GSZ9; _ga=GA1.1.2133856958.1769328437; JSESSIONlD=naitikchattaraj|CA14EX28TFXFHNZJMN8W5QK6HIIA0N';

async function check() {
    try {
        const res = await axios({
            method: 'GET',
            url: `https://vjudge.net/contest/ajaxData?id=${contestId}`,
            headers: {
                'Cookie': cookies.replace(/JSESSlONID/g, 'JSESSIONID').replace(/JSESSIONlD/g, 'JSESSIONID'),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        console.log('Status:', res.status);
        console.log('HTML Length:', res.data.length);
        fs.writeFileSync('ajax_data.html', res.data);

        // Search for problem titles in typical VJudge patterns
        // They often look like data-probNum="A" and then the title nearby
        const matches = res.data.match(/<td class="prob-num">([A-Z]+)<\/td>[\s\S]*?<a href=".*?" target="_blank">(.*?)<\/a>/g);
        if (matches) {
            console.log('Found problems in HTML table!');
            matches.forEach(m => {
                const parts = m.match(/<td class="prob-num">([A-Z]+)<\/td>[\s\S]*?<a href=".*?" target="_blank">(.*?)<\/a>/);
                if (parts) console.log(`${parts[1]}: ${parts[2]}`);
            });
        } else {
            console.log('No problem table found in HTML.');
            // Try looking for JSON in script tags if it's not a fragment
            const jsonMatch = res.data.match(/var\s+data\s*=\s*({[\s\S]*?});/);
            if (jsonMatch) {
                console.log('Found var data JSON!');
            }
        }

    } catch (e) {
        console.log('Error:', e.message);
    }
}

check();
