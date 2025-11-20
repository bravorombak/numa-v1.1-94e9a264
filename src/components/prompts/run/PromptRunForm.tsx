import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import type { PromptVariable } from "@/lib/variableDetection";

interface PromptRunFormProps {
  promptVersion: {
    variables: any;
    [key: string]: any;
  };
}

export const PromptRunForm = ({ promptVersion }: PromptRunFormProps) => {
  const variables = Array.isArray(promptVersion.variables)
    ? (promptVersion.variables as PromptVariable[])
    : [];

  // Sort variables by order property
  const sortedVariables = [...variables].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  // Initialize form with default values
  const defaultValues: Record<string, any> = {};
  sortedVariables.forEach((variable) => {
    if (variable.type === "checkboxes") {
      defaultValues[variable.name] = "";
    } else if (variable.type === "number") {
      defaultValues[variable.name] = "";
    } else {
      defaultValues[variable.name] = "";
    }
  });

  const form = useForm<Record<string, any>>({
    defaultValues,
  });

  const onSubmit = (values: Record<string, any>) => {
    console.log("Form submitted (Phase 7.2 stub):", values);
    toast({
      title: "Form submitted",
      description: "Phase 7.2: Session creation will be added in Phase 7.4",
    });
  };

  const renderInput = (variable: PromptVariable, field: any) => {
    switch (variable.type) {
      case "text":
      case "email":
      case "url":
        return (
          <Input
            type={variable.type}
            placeholder={variable.placeholder}
            {...field}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={variable.placeholder}
            {...field}
            onChange={(e) => field.onChange(e.target.value)}
          />
        );

      case "long_text":
        return (
          <Textarea
            rows={4}
            placeholder={variable.placeholder}
            {...field}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            placeholder={variable.placeholder}
            {...field}
          />
        );

      case "dropdown":
        return (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder={variable.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {(variable.options || []).map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkboxes":
        const selected = field.value ? field.value.split(",").filter(Boolean) : [];
        return (
          <div className="space-y-2">
            {(variable.options || []).map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={(checked) => {
                    const newSelected = checked
                      ? [...selected, option]
                      : selected.filter((s: string) => s !== option);
                    field.onChange(newSelected.join(","));
                  }}
                />
                <Label className="font-normal cursor-pointer">{option}</Label>
              </div>
            ))}
          </div>
        );

      case "file":
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              field.onChange(file?.name || "");
            }}
          />
        );

      default:
        return (
          <Input
            type="text"
            placeholder={variable.placeholder}
            {...field}
          />
        );
    }
  };

  // Handle case when no variables exist
  if (sortedVariables.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This prompt has no input variables.
        </p>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              console.log("No variables, direct session creation");
              toast({
                title: "Ready to start",
                description: "Session creation will be added in Phase 7.4",
              });
            }}
            size="lg"
          >
            Start Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {sortedVariables.map((variable) => (
          <FormField
            key={variable.name}
            control={form.control}
            name={variable.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {variable.label || variable.name}
                  {variable.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>{renderInput(variable, field)}</FormControl>
                {variable.description && (
                  <FormDescription>{variable.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg">
            Start Session
          </Button>
        </div>
      </form>
    </Form>
  );
};
