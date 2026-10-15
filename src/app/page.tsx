import Faq from '@/components/Faq';
import Hero from '@/components/Hero';
import Intro from '@/components/Intro';
import HowItWorks from '@/components/HowItWorks';
import Segments from '@/components/home/Segments';
import Chapter from '@/components/chapter/Chapter';

/**
 * The home page, in order: the hero (one sample collection, laid flat), the
 * chapter (the interactive hoodie), what we do, who we make it for (the one
 * dusty-blue band), how it works, and the questions. Every other ground is
 * paper; one frame (max 1536px, the header's) so every left edge lines up.
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
