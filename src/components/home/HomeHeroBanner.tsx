import homeHeroImage from '@/assets/home-hero.jpg';

export const HomeHeroBanner = () => (
  <div className="w-full h-[140px] sm:h-[160px] md:h-[180px] lg:h-[200px]">
    <img
      src={homeHeroImage}
      alt="Numa home hero"
      className="w-full h-full object-cover"
    />
  </div>
);
