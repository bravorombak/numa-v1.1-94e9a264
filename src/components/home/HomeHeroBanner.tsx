import homeHeroImage from '@/assets/home-hero.jpg';

interface HomeHeroBannerProps {
  greeting: string;
  subtitle: string;
}

export const HomeHeroBanner = ({ greeting, subtitle }: HomeHeroBannerProps) => (
  <section className="w-full border-b bg-card">
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="relative overflow-hidden rounded-lg">
        {/* Hero Image */}
        <img
          src={homeHeroImage}
          alt="Numa home hero"
          className="h-32 w-full object-cover sm:h-40 md:h-52"
        />
        
        {/* Dark gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Text overlay, bottom-left */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 flex flex-col gap-1 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-header font-extrabold text-background">
            {greeting}
          </h1>
          <p className="text-sm sm:text-base text-background/90">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  </section>
);
