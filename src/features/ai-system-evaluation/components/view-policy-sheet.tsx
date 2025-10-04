import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewEditSheet } from "@/components/patterns";
import type { Guardrail } from "@/types";

interface ViewPolicySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: Guardrail | null;
}

export function ViewPolicySheet({
  open,
  onOpenChange,
  policy,
}: ViewPolicySheetProps) {
  const [activeTab, setActiveTab] = useState("allowed");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Inactive
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Unknown
          </Badge>
        );
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      Content: "bg-amber-100 text-amber-800 border-amber-200",
      Safety: "bg-red-100 text-red-800 border-red-200",
      "PII Detection": "bg-gray-100 text-gray-800 border-gray-200",
      "Key Word Detection": "bg-gray-100 text-gray-800 border-gray-200",
      "Hallucination Detection": "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <Badge
        variant="outline"
        className={
          categoryColors[category as keyof typeof categoryColors] ||
          "bg-gray-100 text-gray-800 border-gray-200"
        }
      >
        {category}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge
        variant="outline"
        className="bg-gray-100 text-gray-800 border-gray-200"
      >
        {type}
      </Badge>
    );
  };

  // Count number of behaviors (non-empty bullet points)
  const countBehaviors = (text: string): number => {
    if (!text || !text.trim()) return 0;
    const lines = text
      .split("\n")
      .filter((line) => line.trim().startsWith("•") && line.trim().length > 1);
    return lines.length;
  };

  if (!policy) return null;

  const allowedCount = countBehaviors((policy.allowedBehavior as string) || "");
  const disallowedCount = countBehaviors(
    (policy.disallowedBehavior as string) || ""
  );

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title={policy.name}
      size="lg"
    >
      <div className="space-y-4">
        {/* Badges Section */}
        <div className="flex flex-wrap gap-2">
          {policy.type && getTypeBadge(policy.type)}
          {policy.category && getCategoryBadge(policy.category)}
          {policy.status && getStatusBadge(policy.status)}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-[0.8125rem]  font-450 text-gray-600">
            Description
          </Label>
          <p className="text-[0.8125rem]  text-gray-900 whitespace-pre-wrap">
            {policy.description || "No description provided"}
          </p>
        </div>

        {/* Behavior Tabs */}
        <div className="space-y-2">
          <Label className="text-[0.8125rem]  font-450 text-gray-600">Behavior</Label>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="allowed">
                Allowed Behavior {allowedCount > 0 && `(${allowedCount})`}
              </TabsTrigger>
              <TabsTrigger value="disallowed">
                Disallowed Behavior{" "}
                {disallowedCount > 0 && `(${disallowedCount})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="allowed" className="mt-4">
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                {policy.allowedBehavior ? (
                  <div className="text-[0.8125rem]  text-gray-900 whitespace-pre-wrap font-mono">
                    {policy.allowedBehavior}
                  </div>
                ) : (
                  <p className="text-[0.8125rem]  text-gray-500">
                    No allowed behaviors defined
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="disallowed" className="mt-4">
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                {policy.disallowedBehavior ? (
                  <div className="text-[0.8125rem]  text-gray-900 whitespace-pre-wrap font-mono">
                    {policy.disallowedBehavior}
                  </div>
                ) : (
                  <p className="text-[0.8125rem]  text-gray-500">
                    No disallowed behaviors defined
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Metadata */}
        <div className="flex gap-6 pt-4 border-t border-gray-200">
          <div className="space-y-1">
            <Label className="text-xs font-450 text-gray-500">Created</Label>
            <p className="text-[0.8125rem]  text-gray-900">{policy.createdAt}</p>
          </div>

          {policy.updatedAt && policy.updatedAt !== policy.createdAt && (
            <div className="space-y-1">
              <Label className="text-xs font-450 text-gray-500">
                Last Updated
              </Label>
              <p className="text-[0.8125rem]  text-gray-900">{policy.updatedAt}</p>
            </div>
          )}
        </div>
      </div>
    </ViewEditSheet>
  );
}
