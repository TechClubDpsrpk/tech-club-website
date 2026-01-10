'use client';

import { motion } from 'framer-motion';

interface TypewriterEffectProps {
    text: string;
    className?: string;
    delay?: number; // Delay before typing starts
}

export function TypewriterEffect({ text, className, delay = 0 }: TypewriterEffectProps) {
    const characters = text.split('');

    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03, // Speed of typing per letter
                delayChildren: delay, // Start typing after this delay
            },
        },
    };

    const childVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    return (
        <motion.p
            className={className}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {characters.map((char, index) => (
                <motion.span key={index} variants={childVariants}>
                    {char}
                </motion.span>
            ))}
        </motion.p>
    );
}
