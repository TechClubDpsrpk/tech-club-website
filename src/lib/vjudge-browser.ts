import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export class VJudgeBrowser {
    private cookies: string;

    constructor(sessionCookies: string) {
        this.cookies = sessionCookies;
    }

    private async getBrowserExecutable(): Promise<string> {
        const fs = require('fs');

        if (process.platform === 'win32') {
            const localPaths = [
                process.env.CHROME_PATH,
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe` : undefined,
                'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
                'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
                process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe` : undefined,
                'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
                process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe` : undefined,
            ];

            for (const p of localPaths) {
                if (p && fs.existsSync(p)) {
                    return p;
                }
            }
            throw new Error('No compatible Chrome/Edge browser found on Windows');
        }

        // Linux / macOS / Serverless
        if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
            return process.env.CHROME_PATH;
        }

        const linuxPaths = [
            '/usr/bin/google-chrome',
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
        ];
        for (const p of linuxPaths) {
            if (fs.existsSync(p)) return p;
        }

        // Fallback to serverless chromium package on Linux
        return await chromium.executablePath();
    }

    async getContestData(contestId: string, contestPassword?: string) {
        let browser = null;
        try {
            console.log('Launching browser for VJudge...');
            chromium.setGraphicsMode = false;

            const isLocal = process.env.NODE_ENV === 'development' || process.platform === 'win32';
            const executablePath = await this.getBrowserExecutable();

            const args = isLocal
                ? puppeteer.defaultArgs().concat([
                    '--ignore-certificate-errors',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-features=FirstPartySets',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled',
                ])
                : chromium.args.concat([
                    '--ignore-certificate-errors',
                    '--disable-blink-features=AutomationControlled',
                ]);

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
                executablePath,
                headless: true,
            });

            const page = await browser.newPage();
            await this.applyStealth(page);

            if (this.cookies) {
                const cookieList = this.cookies.split(';').map(c => {
                    const [name, value] = c.trim().split('=');
                    return {
                        name,
                        value,
                        domain: '.vjudge.net',
                        path: '/',
                        secure: true,
                        httpOnly: false,
                    };
                });
                await page.setCookie(...cookieList);
            }

            console.log(`Navigating to contest ${contestId}...`);
            const targetUrl = `https://vjudge.net/contest/${contestId}`;

            await page.goto(targetUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 25000
            });

            try {
                await page.waitForSelector('.contest-title', { timeout: 8000 });
            } catch (e) {
                console.warn('Wait for .contest-title timed out, checking page title...');
            }

            const title = await page.title();
            console.log('Page title:', title);

            if (title.includes('Just a moment') || title.includes('Cloudflare')) {
                throw new Error('Cloudflare challenge not solved');
            }

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

            return {
                contestData,
                pageTitle: title
            };

        } catch (error) {
            console.error('VJudge Browser Error:', error);
            throw error;
        } finally {
            if (browser) {
                try { await browser.close(); } catch { }
            }
        }
    }

    async getRankData(contestId: string, contestPassword?: string) {
        let browser = null;
        try {
            chromium.setGraphicsMode = false;
            const isLocal = process.env.NODE_ENV === 'development' || process.platform === 'win32';
            const executablePath = await this.getBrowserExecutable();

            const args = isLocal
                ? puppeteer.defaultArgs().concat([
                    '--ignore-certificate-errors',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-features=FirstPartySets',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled',
                ])
                : chromium.args.concat([
                    '--ignore-certificate-errors',
                    '--disable-blink-features=AutomationControlled',
                ]);

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
                executablePath,
                headless: true,
            });

            const page = await browser.newPage();
            await this.applyStealth(page);
            if (this.cookies) {
                const cookieList = this.cookies.split(';').map(c => {
                    const [name, value] = c.trim().split('=');
                    return { name, value, domain: '.vjudge.net', path: '/', secure: true, httpOnly: false };
                });
                await page.setCookie(...cookieList);
            }

            const targetUrl = `https://vjudge.net/contest/${contestId}`;
            await page.goto(targetUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 25000
            });

            try {
                await page.waitForSelector('.contest-title', { timeout: 8000 });
            } catch (e) { }

            // Fetch rank data
            const rankData = await page.evaluate(async (cId: string, cPwd?: string) => {
                const url = `/contest/rank/single/${cId}${cPwd ? `?password=${encodeURIComponent(cPwd)}` : ''}`;
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
            if (browser) {
                try { await browser.close(); } catch { }
            }
        }
    }

    private async applyStealth(page: any) {
        const REAL_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

        // Reveal Puppeteer: mask navigator.webdriver
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });

        // Set a realistic User-Agent
        await page.setUserAgent(REAL_USER_AGENT);

        // Overcome some fingerprinting
        await page.evaluateOnNewDocument(() => {
            // @ts-ignore
            window.chrome = {
                runtime: {},
            };
            // @ts-ignore
            const originalQuery = window.navigator.permissions.query;
            // @ts-ignore
            window.navigator.permissions.query = (parameters: any) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: (Notification as any).permission }) :
                    originalQuery(parameters)
            );
        });
    }
}
