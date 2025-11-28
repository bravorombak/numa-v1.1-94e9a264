import homeHeroImage from '@/assets/home-hero.jpg';

interface HomeHeroBannerProps {
  greeting: string;
  subtitle: string;
}

export const HomeHeroBanner = ({ greeting, subtitle }: HomeHeroBannerProps) => (
  <div className="relative w-full h-[160px] sm:h-[180px] md:h-[200px]">
    {/* Base image */}
    <img
      src={homeHeroImage}
      alt="Numa home hero"
      className="w-full h-full object-cover"
    />

    {/* Dark gradient overlay for contrast */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

    {/* Text overlay, bottom-left */}
    <div className="absolute inset-x-0 bottom-0 px-4 sm:px-6 pb-4 sm:pb-5 flex flex-col gap-1 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-header font-extrabold text-background">
        {greeting}
      </h1>
      <p className="text-sm sm:text-base text-background/90">
        {subtitle}
      </p>
    </div>
  </div>
);
