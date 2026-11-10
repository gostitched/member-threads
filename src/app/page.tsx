import Faq from '@/components/Faq';
import Hero from '@/components/Hero';
import Intro from '@/components/Intro';
import HowItWorks from '@/components/HowItWorks';
import Chapter from '@/components/chapter/Chapter';

/**
 * The home page, in order: the hero (the headline and two photographs on a beige
 * plate), the chapter (the toy hoodie on its grid, the three-piece row, the green
 * finale), what we are, four steps, the questions. Every other ground is paper; one
 * frame (`.shell`) so every left edge lines up with the logo.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Chapter />
      <Intro />
      <HowItWorks />
      <Faq />
    </>
  );
}
