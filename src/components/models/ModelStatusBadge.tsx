import { Badge } from "@/components/ui/badge";

type ModelStatusBadgeProps = {
  status: "active" | "inactive";
};

export const ModelStatusBadge = ({ status }: ModelStatusBadgeProps) => {
  const variants = {
    active: "default",
    inactive: "secondary",
  } as const;

  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  );
};
