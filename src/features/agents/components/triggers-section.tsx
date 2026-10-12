"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Calendar, ChevronDown, ChevronRight, Plus } from "lucide-react";

import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { AgentScheduleDialog } from "./agent-schedule-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { MANUAL_TRIGGERS } from "../lib/constants";
import { formatScheduleLabel } from "../lib/utils";

interface TriggersSectionProps {
  agent: Doc<"agents">;
}

export function TriggersSection({ agent }: TriggersSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const schedules = useQuery(api.agentsCreation.getAgentSchedules, {
    agentId: agent._id,
  });
  const updateTriggers = useMutation(api.agentsCreation.updateAgentTriggers);

  const scheduleCount = schedules?.length ?? 0;
  const manualCount = MANUAL_TRIGGERS.filter(
    (t) => agent.manualTriggers[t.key],
  ).length;
  const totalCount = scheduleCount + manualCount;

  const handleToggle = async (
    key: keyof Doc<"agents">["manualTriggers"],
    checked: boolean,
  ) => {
    await updateTriggers({
      agentId: agent._id,
      manualTriggers: {
        ...agent.manualTriggers,
        [key]: checked,
      },
    });
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-2">
          {isOpen ? (
            <ChevronDown className="size-3.5 text-muted-foreground/70" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground/70" />
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[15px]">Triggers</span>
            <Badge
              variant="secondary"
              className="text-[10px] h-4 px-1 min-w-4 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground border-none"
            >
              {totalCount}
            </Badge>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-11 py-2 space-y-4">
            <div>
              <p className="text-xs font-medium mb-2">Manual {manualCount}</p>
              <div className="space-y-2">
                {MANUAL_TRIGGERS.map((trigger) => {
                  const Icon = trigger.icon;
                  return (
                    <div
                      key={trigger.key}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="size-3.5 text-muted-foreground" />
                        <div>
                          <span className="text-sm">{trigger.label}</span>
                          <p className="text-xs text-muted-foreground">
                            {trigger.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={agent.manualTriggers[trigger.key]}
                        onCheckedChange={(checked) =>
                          handleToggle(trigger.key, checked)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium mb-2">
                Scheduled {scheduleCount}
              </p>
              {schedules && schedules.length > 0 ? (
                <div className="space-y-1">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule._id}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        <span className="text-sm">
                          {formatScheduleLabel(schedule)}
                        </span>
                      </div>
                      <Switch checked disabled />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-1">
                  No schedules yet
                </p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground mt-2 h-8 -ml-2"
                onClick={() => setScheduleDialogOpen(true)}
              >
                <Plus className="size-3.5" />
                Add schedule
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <AgentScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        agentId={agent._id}
      />
    </>
  );
}
