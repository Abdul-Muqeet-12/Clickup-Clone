"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NAME_MAX_LENGTH } from "@/features/general/lib/constants";

const DEFAULT_ORGANIZATION_NAME = "My Workspace";

export default function GeneralSettings() {
  const [name, setName] = useState(DEFAULT_ORGANIZATION_NAME);
  const [savedName, setSavedName] = useState(DEFAULT_ORGANIZATION_NAME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const trimmedName = name.trim();

  const canSave =
    trimmedName.length > 0 &&
    trimmedName.length <= NAME_MAX_LENGTH &&
    trimmedName !== savedName;

  const handleSave = () => {
    if (!canSave) return;

    setSavedName(trimmedName);
    setName(trimmedName);
    toast.success("Organization name updated for this demo.");
  };

  if (!mounted) {
    return <div className="space-y-8" />;
  }

  return (
    <div className="relative space-y-8">
      <section className="rounded-lg border border-border/60 bg-background">
        <div className="space-y-4 p-4">
          <div>
            <h2 className="text-sm font-semibold">Organization</h2>
            <p className="text-sm text-muted-foreground">
              Update your organization name and details.
            </p>
          </div>

          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Organization name"
            maxLength={NAME_MAX_LENGTH}
            className="max-w-sm"
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
          <span className="text-xs text-muted-foreground">
            Please use {NAME_MAX_LENGTH} characters at maximum.
          </span>

          <Button onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-border/60 bg-background p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Security</h2>
            <p className="text-sm text-muted-foreground">
              Manage your password and multi-factor authentication.
            </p>
          </div>

          <div className="w-full lg:max-w-lg">
            <div className="rounded-md border border-border/60 p-4">
              <p className="text-sm font-medium">Security settings</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Account security management is unavailable in frontend demo
                mode.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  toast.info("Real security settings require authentication.")
                }
              >
                Manage security
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-border/60 bg-background p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Sessions</h2>
            <p className="text-sm text-muted-foreground">
              Review active sessions across your devices.
            </p>
          </div>

          <div className="w-full lg:max-w-lg">
            <div className="rounded-md border border-border/60 p-4">
              <p className="text-sm font-medium">Active sessions</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Session information is unavailable without a connected account.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  toast.info("Real session management requires authentication.")
                }
              >
                View sessions
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}