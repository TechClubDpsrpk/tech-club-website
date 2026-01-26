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
            let executablePath: string | undefined;

            if (isLocal) {
                // Common local Chrome paths on Windows
                const localPaths = [
                    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                    process.env.CHROME_PATH // Optional env override
                ];

                for (const path of localPaths) {
                    if (path && require('fs').existsSync(path)) {
                        executablePath = path;
                        break;
                    }
                }

                if (!executablePath) {
                    console.warn('Local Chrome not found! Falling back to chromium.executablePath()');
                    executablePath = await chromium.executablePath();
                }
            } else {
                executablePath = await chromium.executablePath();
            }

            const args = isLocal
                ? puppeteer.defaultArgs().concat([
                    '--ignore-certificate-errors',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-features=FirstPartySets', // Mitigate EBUSY/resource lock
                    '--disable-dev-shm-usage',
                ])
                : chromium.args.concat(['--ignore-certificate-errors']);

            browser = await puppeteer.launch({
                args,
                defaultViewport: {
                    width: 1280,
                    height: 720,
                    deviceScaleFactor: 1,
                    isMobile: false,
                    hasTouch: false,
                    isLandscape: false,
                },
                executablePath: executablePath,
                headless: isLocal ? false : true,
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

            // Increase timeout and use 'load' to be less strict about background resources
            await page.goto(targetUrl, {
                waitUntil: 'load',
                timeout: 60000
            });

            // Wait for a realistic element to confirm we are past any initial loading/challenges
            try {
                await page.waitForSelector('.contest-title', { timeout: 10000 });
            } catch (e) {
                console.warn('Wait for .contest-title timed out, checking Cloudflare status...');
            }

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

                    const text = await response.text();
                    try {
                        return JSON.parse(text);
                    } catch (parseError) {
                        return {
                            error: 'Failed to parse JSON response',
                            contentSnippet: text.substring(0, 200),
                            status: response.status
                        };
                    }
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
            const isLocal = process.env.NODE_ENV === 'development';
            let executablePath: string | undefined;

            if (isLocal) {
                const localPaths = [
                    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                    process.env.CHROME_PATH
                ];
                for (const path of localPaths) {
                    if (path && require('fs').existsSync(path)) {
                        executablePath = path;
                        break;
                    }
                }
                if (!executablePath) executablePath = await chromium.executablePath();
            } else {
                executablePath = await chromium.executablePath();
            }

            const args = isLocal
                ? puppeteer.defaultArgs().concat([
                    '--ignore-certificate-errors',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-features=FirstPartySets',
                    '--disable-dev-shm-usage',
                ])
                : chromium.args.concat(['--ignore-certificate-errors']);

            browser = await puppeteer.launch({
                args,
                defaultViewport: {
                    width: 1280,
                    height: 720,
                    deviceScaleFactor: 1,
                    isMobile: false,
                    hasTouch: false,
                    isLandscape: false,
                },
                executablePath: executablePath,
                headless: isLocal ? false : true,
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
            await page.goto(targetUrl, {
                waitUntil: 'load',
                timeout: 60000
            });

            try {
                await page.waitForSelector('.contest-title', { timeout: 10000 });
            } catch (e) { }

            // Fetch rank data
            const rankData = await page.evaluate(async (cId: string, cPwd?: string) => {
                const url = `/contest/rank/single/${cId}${cPwd ? `?password=${cPwd}` : ''}`;
                try {
                    const response = await fetch(url);
                    const text = await response.text();
                    try {
                        return JSON.parse(text);
                    } catch (parseError) {
                        return {
                            error: 'Failed to parse JSON response',
                            contentSnippet: text.substring(0, 200),
                            status: response.status
                        };
                    }
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
