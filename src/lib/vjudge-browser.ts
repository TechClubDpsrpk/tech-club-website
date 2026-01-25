import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export class VJudgeBrowser {
    private cookies: string;

    constructor(sessionCookies: string) {
        this.cookies = sessionCookies;
    }

    async getContestData(contestId: string, contestPassword?: string) {
        let browser = null;
        try {
            console.log('Launching browser for VJudge...');

            // Configure chromium for Vercel/Serverless
            chromium.setGraphicsMode = false;

            const isLocal = process.env.NODE_ENV === 'development';

            // For local development, we might need a local chrome path or just fail gracefully
            const executablePath = await chromium.executablePath() ||
                (isLocal ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined);

            browser = await puppeteer.launch({
                args: isLocal ? puppeteer.defaultArgs() : chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: executablePath,
                headless: isLocal ? false : chromium.headless, // Run headed locally for debug if needed, or headless
                ignoreHTTPSErrors: true,
            });

            const page = await browser.newPage();

            // Set session cookies if provided
            if (this.cookies) {
                const cookieList = this.cookies.split(';').map(c => {
                    const [name, value] = c.trim().split('=');
                    return {
                        name,
                        value,
                        domain: '.vjudge.net',
                        path: '/',
                        secure: true,
                        httpOnly: false, // Usually true but we are setting manually
                    };
                });
                await page.setCookie(...cookieList);
            }

            console.log(`Navigating to contest ${contestId}...`);
            const targetUrl = `https://vjudge.net/contest/${contestId}`;

            // Navigate and wait for network idle to ensure Cloudflare challenge is passed
            await page.goto(targetUrl, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // If there's a password, we might need to enter it?
            // Usually if we have the cookie we are already logged in or authorized?
            // If the user isn't logged in, we can't see private contests. 
            // The provided cookies should handle authentication.

            // Wait specifically for the contest title or some element that indicates success
            // If Cloudflare is still there, we might need to wait more or check for challenge

            const title = await page.title();
            console.log('Page title:', title);

            if (title.includes('Just a moment') || title.includes('Cloudflare')) {
                throw new Error('Cloudflare challenge not solved');
            }

            // Fetch data using the browser context (which has the valid Cloudflare cookies)
            const contestData = await page.evaluate(async (cId: string, cPwd?: string) => {
                const params = new URLSearchParams();
                params.append('id', cId);
                if (cPwd) params.append('password', cPwd);

                try {
                    const response = await fetch('/contest/view/ajaxData', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: params.toString()
                    });
                    return await response.json();
                } catch (e: any) {
                    return { error: e.toString() };
                }
            }, contestId, contestPassword);

            if (contestData.error) {
                console.error('Browser fetch error:', contestData.error);
            }

            // Fallback: if ajaxData fails, scrape the page directly
            // ... (keep minimal fallback or rely on fetch)

            return contestData;

        } catch (error) {
            console.error('VJudge Browser Error:', error);
            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    async getRankData(contestId: string, contestPassword?: string) {
        let browser = null;
        try {
            console.log('Launching browser for VJudge Rank Data...');
            const isLocal = process.env.NODE_ENV === 'development';

            chromium.setGraphicsMode = false;
            const executablePath = await chromium.executablePath() ||
                (isLocal ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined);

            browser = await puppeteer.launch({
                args: isLocal ? puppeteer.defaultArgs() : chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: executablePath,
                headless: isLocal ? false : chromium.headless,
                ignoreHTTPSErrors: true,
            });

            const page = await browser.newPage();
            if (this.cookies) {
                const cookieList = this.cookies.split(';').map(c => {
                    const [name, value] = c.trim().split('=');
                    return { name, value, domain: '.vjudge.net', path: '/', secure: true, httpOnly: false };
                });
                await page.setCookie(...cookieList);
            }

            const targetUrl = `https://vjudge.net/contest/${contestId}`;
            await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30000 });

            // Fetch rank data
            const rankData = await page.evaluate(async (cId: string, cPwd?: string) => {
                const url = `/contest/rank/single/${cId}${cPwd ? `?password=${cPwd}` : ''}`;
                try {
                    const response = await fetch(url);
                    return await response.json();
                } catch (e: any) {
                    return { error: e.toString() };
                }
            }, contestId, contestPassword);

            if (rankData.error) console.error('Browser rank fetch error:', rankData.error);
            return rankData;

        } catch (error) {
            console.error('VJudge Browser Rank Error:', error);
            throw error;
        } finally {
            if (browser) await browser.close();
        }
    }
}
