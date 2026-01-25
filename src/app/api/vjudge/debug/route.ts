import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
    try {
        const testUrl = 'https://vjudge.net';
        console.log('Testing VJudge connection options...');

        // Test 1: Simple GET to root
        const start1 = Date.now();
        const res1 = await axios.get(testUrl, {
            validateStatus: () => true, // Don't throw on error status
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const duration1 = Date.now() - start1;

        // Test 2: Check IP (optional, helps identifying if we are blocked)
        let ipInfo = null;
        try {
            const ipRes = await axios.get('https://api.ipify.org?format=json');
            ipInfo = ipRes.data;
        } catch (e) {
            ipInfo = { error: 'Could not fetch IP' };
        }

        return NextResponse.json({
            status: 'Diagnostic Complete',
            serverIp: ipInfo,
            vjudge: {
                url: testUrl,
                status: res1.status,
                statusText: res1.statusText,
                duration: `${duration1}ms`,
                headers: res1.headers,
                // Return a snippet of the body to see if it's a captcha page
                bodySnippet: typeof res1.data === 'string' ? res1.data.substring(0, 500) : 'Body is not string'
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            status: 'Diagnostic Failed',
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
