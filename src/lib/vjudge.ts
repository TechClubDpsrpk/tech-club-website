import axios, { AxiosInstance } from 'axios';

export class VJudgeClient {
    private client: AxiosInstance;
    private cookies: string;

    constructor(sessionCookies?: string) {
        // Sanitize cookies and common typos (e.g. lowercase 'l' for 'I')
        this.cookies = (sessionCookies || '')
            .trim()
            .replace(/JSESSlONID/g, 'JSESSIONID')
            .replace(/JSESSIONlD/g, 'JSESSIONID');

        const headers: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'en-US,en;q=0.9',
        };

        if (this.cookies) {
            headers['Cookie'] = this.cookies;
        }

        this.client = axios.create({
            baseURL: 'https://vjudge.net',
            headers,
            timeout: 12000,
        });
    }

    /**
     * Fetches general contest data (title, problems).
     * Falls back to rank data if ajaxData is blocked or unavailable.
     */
    async getContestData(contestId: string, contestPassword?: string, problemCount: number = 10, problemTitles?: string) {
        try {
            const params = new URLSearchParams();
            params.append('id', contestId);
            if (contestPassword) {
                params.append('password', contestPassword);
            }

            // Try the contest ajaxData endpoint first
            const response = await this.client.post('/contest/view/ajaxData', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Referer': `https://vjudge.net/contest/${contestId}`,
                }
            });

            let data = response.data;
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch {
                    // Response is HTML or unparseable text
                    data = null;
                }
            }

            if (!data || typeof data !== 'object' || !data.title) {
                console.warn('VJudge: Unexpected response from ajaxData, checking standings for fallback info.');
                const rankData = await this.getRankData(contestId, contestPassword);
                return {
                    title: rankData.title || `Contest ${contestId}`,
                    problems: this.generateProblems(problemCount, problemTitles),
                    id: contestId
                };
            }

            return data;
        } catch (error: any) {
            console.warn(`VJudge Fetch Contest Data Error (${error.message}), attempting fallback via rank data...`);

            // FALLBACK: Try to get info from the rank endpoint if ajaxData fails
            try {
                const rankData = await this.getRankData(contestId, contestPassword);
                return {
                    title: rankData.title || `Contest ${contestId}`,
                    problems: this.generateProblems(problemCount, problemTitles),
                    id: contestId
                };
            } catch (innerError: any) {
                console.error('VJudge Fallback Error:', innerError.message);
                throw error;
            }
        }
    }

    /**
     * Fetches real-time standings JSON directly.
     */
    async getRankData(contestId: string, contestPassword?: string) {
        try {
            const url = `/contest/rank/single/${contestId}${contestPassword ? `?password=${encodeURIComponent(contestPassword)}` : ''}`;
            const response = await this.client.get(url, {
                headers: {
                    'Referer': `https://vjudge.net/contest/${contestId}`,
                }
            });

            let data = response.data;
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch {
                    throw new Error('VJudge rank endpoint returned non-JSON response (possibly HTML/Cloudflare)');
                }
            }

            if (!data || typeof data !== 'object') {
                throw new Error('Invalid response structure from VJudge rank endpoint');
            }

            return data;
        } catch (error) {
            console.error('VJudge Fetch Rank Data Error:', error);
            throw error;
        }
    }

    /**
     * Generates problem list based on count (A, B, C...)
     * If titles are provided (comma-separated), uses them; otherwise just shows letters
     */
    generateProblems(count: number, titlesString?: string) {
        const titles = titlesString ? titlesString.split(',').map(t => t.trim()) : [];
        const problems = [];

        for (let i = 0; i < count; i++) {
            const letter = String.fromCharCode(65 + i);
            problems.push({
                num: letter,
                title: titles[i] || letter,
            });
        }
        return problems;
    }
}
