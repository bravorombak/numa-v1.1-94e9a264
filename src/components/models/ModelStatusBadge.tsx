import { Badge } from "@/components/ui/badge";

type ModelStatusBadgeProps = {
  status: "active" | "deprecated" | "disabled";
};

export const ModelStatusBadge = ({ status }: ModelStatusBadgeProps) => {
  const variants = {
    active: "default",
    deprecated: "secondary",
    disabled: "destructive",
  } as const;

  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  );
};
