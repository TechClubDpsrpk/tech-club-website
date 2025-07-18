'use client';
import { useEffect, useState } from 'react';

const words = ['Tech', 'Creative', 'Robotics', 'Design', 'Innovation'];

const RotatingWord = () => {
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (pause) return;

    const currentWord = words[index % words.length];

    const timeout = setTimeout(
      () => {
        const nextText = isDeleting
          ? currentWord.slice(0, displayedText.length - 1)
          : currentWord.slice(0, displayedText.length + 1);

        setDisplayedText(nextText);

        if (!isDeleting && nextText === currentWord) {
          setPause(true);
          setTimeout(() => setIsDeleting(true), 1000); // pause after typing
          setTimeout(() => setPause(false), 2000);
        } else if (isDeleting && nextText === '') {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % words.length);
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, index, pause]);

  return (
    <span className="font-2xl font-[family-name:var(--font-vt)] text-[#fac924]">
      ({displayedText}
      <span className="animate-pulse">|</span>)
    </span>
  );
};

export default RotatingWord;
