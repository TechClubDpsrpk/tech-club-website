const axios = require('axios');

const contestId = '784080';
const cookies = "JSESSlONID=4XFJFH68MK67LBIDDVNGXGB3FW48GSZ9; JSESSIONlD=naitikchattaraj|CA14EX28TFXFHNZJMN8W5QK6HIIA0N";

const endpoints = [
    `/contest/view/ajaxData`,
    `/contest/view/ajaxdata`,
    `/contest/ajaxData`,
    `/contest/ajaxdata`,
    `/contest/problemList/${contestId}`,
    `/contest/view/problemList/${contestId}`,
    `/contest/problems?id=${contestId}`,
    `/contest/data?id=${contestId}`,
    `/contest/rank/single/${contestId}`
];

async function check() {
    for (const url of endpoints) {
        console.log(`\n--- Testing ${url} ---`);
        try {
            const hasQueryParams = url.includes('?');
            const fullUrl = `https://vjudge.net${url}${(hasQueryParams ? '&' : '?')}id=${contestId}`;

            const res = await axios({
                method: 'GET',
                url: fullUrl,
                headers: {
                    'Cookie': cookies,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            console.log(`GET: ${res.status} (len: ${JSON.stringify(res.data).length})`);
            if (res.data.problems) console.log('Found Problems in GET!');

            const resPost = await axios({
                method: 'POST',
                url: `https://vjudge.net${url}`,
                headers: {
                    'Cookie': cookies,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: new URLSearchParams({ id: contestId }).toString()
            });
            console.log(`POST: ${resPost.status} (len: ${JSON.stringify(resPost.data).length})`);
            if (resPost.data.problems) console.log('Found Problems in POST!');

        } catch (e) {
            console.log(`Failed: ${e.response ? e.response.status : e.message}`);
        }
    }
}

check();
