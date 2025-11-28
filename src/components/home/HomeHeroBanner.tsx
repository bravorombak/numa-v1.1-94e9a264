import homeHeroImage from '@/assets/home-hero.jpg';

export const HomeHeroBanner = () => (
  <div className="w-full h-[140px] rounded-xl overflow-hidden shadow-sm">
    <img
      src={homeHeroImage}
      alt="Numa home hero"
      className="w-full h-full object-cover"
    />
  </div>
);
