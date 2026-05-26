import BlogSection from '@/components/home/blogSection';
import Clubs from '@/components/home/clubs';
import Hero from '@/components/home/hero';
import Intro from '@/components/home/intro';
import SummerCampNotification from '@/components/home/summer-camp-notification';

export default function Home() {
  return (
    <>
      <Hero data-navbar-theme="dark" />
      <Intro data-navbar-theme="dark" />
      <Clubs data-navbar-theme="dark" />
      <BlogSection data-navbar-theme="dark" />
      <SummerCampNotification />
    </>
  );
}

