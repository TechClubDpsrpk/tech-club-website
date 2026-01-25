import axios, { AxiosInstance } from 'axios';

export class VJudgeClient {
    private client: AxiosInstance;
    private cookies: string;

    constructor(sessionCookies: string) {
        this.cookies = sessionCookies;
        this.client = axios.create({
            baseURL: 'https://vjudge.net',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Cookie': this.cookies,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
            },
        });
    }

    /**
     * Fetches general contest data (title, problems).
     * Note: This endpoint is very sensitive to headers and cookies.
     */
    async getContestData(contestId: string, contestPassword?: string, problemCount: number = 10, problemTitles?: string) {
        try {
            const params = new URLSearchParams();
            params.append('id', contestId);
            if (contestPassword) {
                params.append('password', contestPassword);
            }

            // Try the most common AJAX endpoint first
            const response = await this.client.post('/contest/view/ajaxData', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Referer': `https://vjudge.net/contest/${contestId}`,
                }
            });

            // If we get an empty object or error message, try some fallbacks
            if (!response.data || typeof response.data !== 'object' || !response.data.title) {
                console.warn('VJudge: Unexpected response from ajaxData, checking standings for fallback info.');
                const rankData = await this.getRankData(contestId, contestPassword);
                return {
                    title: rankData.title || `Contest ${contestId}`,
                    problems: this.generateProblems(problemCount, problemTitles),
                    id: contestId
                };
            }

            return response.data;
        } catch (error: any) {
            console.error(`VJudge Fetch Contest Data Error:`, {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                headers: error.response?.headers,
                data: error.response?.data
            });

            // FALLBACK: Try to get info from the rank endpoint if meta fails
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
     * Fetches real-time standings.
     * This endpoint is more reliable.
     */
    async getRankData(contestId: string, contestPassword?: string) {
        try {
            const url = `/contest/rank/single/${contestId}${contestPassword ? `?password=${contestPassword}` : ''}`;
            const response = await this.client.get(url);
            return response.data;
        } catch (error) {
            console.error('VJudge Fetch Rank Data Error:', error);
            throw error;
        }
    }

    /**
     * Generates problem list based on count (A, B, C...)
     * If titles are provided (comma-separated), uses them; otherwise just shows letters
     */
    private generateProblems(count: number, titlesString?: string) {
        const titles = titlesString ? titlesString.split(',').map(t => t.trim()) : [];
        const problems = [];

        for (let i = 0; i < count; i++) {
            const letter = String.fromCharCode(65 + i);
            problems.push({
                num: letter,
                title: titles[i] || letter, // Use provided title or just the letter
            });
        }
        return problems;
    }
}
