import Faq from '@/components/Faq';
import Hero from '@/components/Hero';
import Intro from '@/components/Intro';
import HowItWorks from '@/components/HowItWorks';
import Chapter from '@/components/chapter/Chapter';

/**
 * White, less is more: the hero, the chapter (the toy hoodie, the
 * three-piece row, the finale), what we are, three steps, four questions. Every ground is
 * paper; cards are white with a hairline, accents baby blue and pink.
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
