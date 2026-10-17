import Faq from '@/components/Faq';
import Hero from '@/components/Hero';
import Intro from '@/components/Intro';
import HowItWorks from '@/components/HowItWorks';
import Segments from '@/components/home/Segments';
import Chapter from '@/components/chapter/Chapter';

/**
 * The home page, in order: the hero (the headline and one photograph), the
 * chapter (the interactive hoodie, on cream), what we do (printed on vs sewn
 * in), the roster (the page's one green band), how it works, and the
 * questions. Every other ground is paper; one frame (`.shell`) so every left
 * edge lines up with the logo.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Chapter />
      <Intro />
      <Segments />
      <HowItWorks />
      <Faq />
    </>
  );
}
