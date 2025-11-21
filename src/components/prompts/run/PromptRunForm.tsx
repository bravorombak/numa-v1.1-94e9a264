import React from "react";
import { useForm, SubmitErrorHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { PromptVariable } from "@/lib/variableDetection";
import { useCreateSession } from "@/hooks/useSessions";

function buildValidationSchema(variables: PromptVariable[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const variable of variables) {
    let field: z.ZodTypeAny;

    switch (variable.type) {
      case "email": {
        if (variable.required) {
          field = z
            .string()
            .trim()
            .min(1, "This field is required.")
            .email("Please enter a valid email address.");
        } else {
          field = z
            .string()
            .trim()
            .email("Please enter a valid email address.")
            .or(z.literal(""))
            .optional();
        }
        break;
      }

      case "url": {
        if (variable.required) {
          field = z
            .string()
            .trim()
            .min(1, "This field is required.")
            .url("Please enter a valid URL.");
        } else {
          field = z
            .string()
            .trim()
            .url("Please enter a valid URL.")
            .or(z.literal(""))
            .optional();
        }
        break;
      }

      case "number": {
        if (variable.required) {
          field = z
            .string()
            .min(1, "This field is required.")
            .refine(
              (val) => !Number.isNaN(Number(val)) && val.trim() !== "",
              "Please enter a valid number."
            );
        } else {
          field = z.string().refine(
            (val) =>
              val === "" || (!Number.isNaN(Number(val)) && val.trim() !== ""),
            "Please enter a valid number."
          );
        }
        break;
      }

      case "text":
      case "long_text":
      case "date":
      case "dropdown": {
        if (variable.required) {
          field = z.string().trim().min(1, "This field is required.");
        } else {
          field = z.string().trim().optional().or(z.literal(""));
        }
        break;
      }

      case "checkboxes": {
        field = z.string();
        if (variable.required) {
          field = field.refine(
            (val) => val && val.split(",").filter(Boolean).length > 0,
            "Please select at least one option."
          );
        } else {
          field = field.optional().or(z.literal(""));
        }
        break;
      }

      case "file": {
        field = z.any();
        if (variable.required) {
          field = field.refine(
            (val) => val && String(val).trim() !== "",
            "Please select a file."
          );
        } else {
          field = field.optional();
        }
        break;
      }

      default:
        field = z.any().optional();
    }

    shape[variable.name] = field;
  }

  return z.object(shape);
}

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

  // Initialize hooks
  const navigate = useNavigate();
  const createSession = useCreateSession();

  // Build validation schema from variables
  const validationSchema = React.useMemo(
    () => buildValidationSchema(sortedVariables),
    [sortedVariables]
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
    resolver: zodResolver(validationSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const onSubmit = async (values: Record<string, any>) => {
    // Block if no model selected
    if (!promptVersion.model_id) {
      toast({
        title: "Model required",
        description: "This prompt has no AI model configured. Please edit the prompt and select a model in the Model tab.",
        variant: "destructive",
      });
      return;
    }

    try {
      const session = await createSession.mutateAsync({
        promptVersionId: promptVersion.id,
        variables: values,
        modelId: promptVersion.model_id,
      });

      navigate(`/chat/${session.id}`);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const onError: SubmitErrorHandler<Record<string, any>> = (errors) => {
    console.log("Validation errors:", errors);
    // Focus on first error field
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      form.setFocus(firstErrorKey);
    }
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
            size="lg"
            onClick={async () => {
              if (!promptVersion.model_id) {
                toast({
                  title: "Model required",
                  description: "Please edit the prompt and select a model first.",
                  variant: "destructive",
                });
                return;
              }

              try {
                const session = await createSession.mutateAsync({
                  promptVersionId: promptVersion.id,
                  variables: {},
                  modelId: promptVersion.model_id,
                });
                navigate(`/chat/${session.id}`);
              } catch (error) {
                console.error("Failed to create session:", error);
              }
            }}
            disabled={createSession.isPending}
          >
            {createSession.isPending ? "Starting session..." : "Start Session"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
        {Object.keys(form.formState.errors).length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Some fields need your attention. Please fix the highlighted fields and try again.
            </AlertDescription>
          </Alert>
        )}

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
          <Button 
            type="submit" 
            size="lg"
            disabled={form.formState.isSubmitting || createSession.isPending}
          >
            {createSession.isPending ? "Starting session..." : "Start Session"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
