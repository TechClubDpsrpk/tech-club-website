const fs = require('fs');

const html = fs.readFileSync('vjudge_contest.html', 'utf8');

console.log('--- Scanning for keywords ---');
const keywords = ['problems', 'vcontest', 'prob', 'titles'];
keywords.forEach(k => {
    const idx = html.indexOf(k);
    if (idx !== -1) {
        console.log(`Keyword "${k}" found at index ${idx}. Surroundings:`);
        console.log(html.substring(idx - 50, idx + 150));
    } else {
        console.log(`Keyword "${k}" not found.`);
    }
});

console.log('\n--- Checking dataJson content ---');
const match = html.match(/name="dataJson">([\s\S]*?)<\/textarea>/);
if (match) {
    console.log('dataJson content found.');
    const json = JSON.parse(match[1]);
    console.log('Keys:', Object.keys(json));
}
