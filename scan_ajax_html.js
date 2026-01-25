const fs = require('fs');

const html = fs.readFileSync('ajax_data.html', 'utf8');

console.log('--- Scanning for tiles/problems ---');
// VJudge problems are usually in a table with certain classes
// Let's look for "Problem A", "Problem B" or the contest ID
const idx = html.indexOf('Problem');
if (idx !== -1) {
    console.log('Found "Problem" at', idx);
    console.log(html.substring(idx - 50, idx + 150));
}

// Look for dataJson again in this fragment
const match = html.match(/name="dataJson">([\s\S]*?)<\/textarea>/);
if (match) {
    const json = JSON.parse(match[1]);
    console.log('dataJson Keys:', Object.keys(json));
    if (json.problems) console.log('dataJson Problems:', json.problems.length);
}

// Search for links that look like problems
const links = html.match(/href="\/problem\/.*?"/g);
if (links) {
    console.log('Found problem links:', links.length);
    console.log('Sample:', links[0]);
}

// Check for ANY script tags and their content
const scripts = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/g);
if (scripts) {
    console.log('Found script tags:', scripts.length);
    scripts.forEach((s, i) => {
        if (s.includes('data') || s.includes('problems')) {
            console.log(`Script ${i} matches!`);
            // console.log(s.substring(0, 200));
        }
    });
}
