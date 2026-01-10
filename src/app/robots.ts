import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://techclubdpsrpk.vercel.app';
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/account/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
