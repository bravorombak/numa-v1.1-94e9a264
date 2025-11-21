interface CategoryBadgeProps {
  name: string;
  bg_color: string;
  text_color: string;
  border_color: string;
  className?: string;
}

export const CategoryBadge = ({
  name,
  bg_color,
  text_color,
  border_color,
  className = '',
}: CategoryBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${className}`}
      style={{
        backgroundColor: bg_color,
        color: text_color,
        border: `1px solid ${border_color}`,
      }}
    >
      {name}
    </span>
  );
};
