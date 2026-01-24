'use client';

import '@/components/home/hero/home.css';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';

const TIPS = [
    'Check announcements regularly to know about new updates from the club.',
    'Get your email verified to take part in quests.',
    'Complete projects to climb the leaderboard.',
    'Top leaderboard players get to showcase skills in interschool fests.',
    'Buckle up and get ready to innovate!',
];

interface LoadingProps {
    isAdmin?: boolean;
    customLogo?: string;
    customText?: string;
    hideTips?: boolean;
}

export default function Loading({
    isAdmin = false,
    customLogo,
    customText,
    hideTips = false
}: LoadingProps) {
    const [currentTip, setCurrentTip] = useState(0);
    const [progress, setProgress] = useState(0);

    const tips = TIPS;
    const logoSrc = customLogo || (isAdmin ? "/tc-core.svg" : "/tc-logo.svg");
    const loadingText = customText || (isAdmin ? "Loading Securely..." : "");

    useEffect(() => {
        // Rotate tips every 5 seconds
        const tipInterval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % tips.length);
        }, 5000);

        // Simulate progress bar
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 1; // Increment progress
            });
        }, 40); // Slower progress for longer visibility

        return () => {
            clearInterval(tipInterval);
            clearInterval(progressInterval);
        };
    }, [tips.length]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
            {/* Centered Content */}
            <div className="flex flex-col items-center justify-center space-y-8">
                {/* Spinning Logo */}
                <div className="relative h-24 w-24 animate-spin-slow">
                    <Image
                        src={logoSrc}
                        alt="Tech Club Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Progress Bar Container */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-1 w-64 overflow-hidden rounded-full bg-gray-800">
                        <div
                            className="h-full bg-[#C9A227] transition-all duration-100 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {loadingText && (
                        <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#C9A227] flex items-center justify-center">
                            {loadingText.replace(/\.+$/, '')}
                            <LoadingDots />
                        </p>
                    )}
                </div>
            </div>

            {/* Rotating Tips at the Bottom */}
            {!hideTips && !isAdmin && (
                <div className="absolute bottom-8 w-full px-4 text-center">
                    <p className="animate-fade-in text-sm font-medium text-gray-400 md:text-base">
                        <span className="mr-2 text-[#C9A227]">TIP:</span>
                        {tips[currentTip]}
                    </p>
                </div>
            )}
        </div>
    );
}

