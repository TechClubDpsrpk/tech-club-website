import type { Metadata } from 'next';
import { Geist, Geist_Mono, Rethink_Sans, Space_Mono, VT323 } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/navigation/header';
import Footer from '@/components/navigation/footer';
import ContactForm from '@/components/home/contactForm';
import { JetBrains_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const rethinkSans = Rethink_Sans({
  variable: '--font-rethink-sans',
  subsets: ['latin'],
  display: 'swap',
});

const instrumentSerif = JetBrains_Mono({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  display: 'swap',
});

const vt = VT323({
  variable: '--font-vt',
  subsets: ['latin'],
  weight: ['400'],
});

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tech Club | DPS Ruby Park',
  description: 'A flagship club of DPS Ruby Park, Kolkata, India',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rethinkSans.variable} ${instrumentSerif.variable} ${vt.variable} ${spaceMono.variable} bg-black font-[family-name:var(--font-rethink-sans)] antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Header /> 
            {children}
            <ContactForm />
            <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
