import BlogSection from '@/components/home/blogSection';
import Clubs from '@/components/home/clubs';
import ContactForm from '@/components/home/contactForm';
import Hero from '@/components/home/hero';
import Intro from '@/components/home/intro';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <BlogSection />
      <Clubs />
    </>
  );
}
