import BlogSection from '@/components/home/blogSection';
import Clubs from '@/components/home/clubs';
import Hero from '@/components/home/hero';
import Intro from '@/components/home/intro';

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
