import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogFooterButtonSet,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { AlertTriangle } from "lucide-react";

interface APIKeyDeleteDialogProps {
  open: boolean;
  keyId: string | null;
  keyName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface AffectedAISystem {
  id: string;
  name: string;
}

export function APIKeyDeleteDialog({
  open,
  keyId,
  keyName,
  onConfirm,
  onCancel,
}: APIKeyDeleteDialogProps) {
  const [affectedSystems, setAffectedSystems] = useState<AffectedAISystem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  useEffect(() => {
    const fetchAffectedSystems = async () => {
      if (!keyId || !open) {
        setAffectedSystems([]);
        setConfirmationText("");
        return;
      }

      setIsLoading(true);
      setConfirmationText("");
      try {
        const { data, error } = await supabase
          .from("ai_systems")
          .select("id, name")
          .eq("config->>apiKeyId", keyId);

        if (error) {
          console.error("Failed to fetch affected AI systems:", error);
          setAffectedSystems([]);
        } else {
          setAffectedSystems(data || []);
        }
      } catch (error) {
        console.error("Error fetching affected AI systems:", error);
        setAffectedSystems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffectedSystems();
  }, [keyId, open]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Delete API Key</DialogTitle>
        </DialogHeader>
        <DialogBody size="xl" scrollable={true}>
          {isLoading ? (
            <div className="text-sm text-gray-600">
              Loading affected AI systems...
            </div>
          ) : affectedSystems.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the API key &quot;{keyName}
                &quot;? This will affect the associated AI System
                {affectedSystems.length !== 1 ? "s" : ""} and it will be
                disconnected.
              </p>
            

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Affected AI Systems:
                </p>
                <ul className="space-y-1">
                  {affectedSystems.map((system) => (
                    <li key={system.id} className="text-sm text-gray-600 pl-4">
                      • {system.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                <p className="text-sm text-red-700">
                  This action is not reversible, please be certain.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmation-input">
                  To Verify, Type <span className="font-mono">delete-api-key</span> Below:
                </Label>
                <Input
                  id="confirmation-input"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Type delete-api-key"
                  className="font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  This action cannot be undone.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmation-input">
                  To Verify, Type <span className="font-mono">delete-api-key</span> Below:
                </Label>
                <Input
                  id="confirmation-input"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Type delete-api-key"
                  className="font-mono"
                />
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet
            variant="danger"
            primaryText="Delete"
            secondaryText="Cancel"
            onPrimaryClick={onConfirm}
            onSecondaryClick={onCancel}
            primaryDisabled={confirmationText !== "delete-api-key"}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
