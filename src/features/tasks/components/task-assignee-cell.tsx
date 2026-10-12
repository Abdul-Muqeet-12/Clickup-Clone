
"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Task } from "@/features/tasks/lib/types";

type TaskAssigneeCellProps = {
  task: Task;
  onUpdate: (assigneeIds: string[]) => void;
};

type DemoAssignee = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  type: "person" | "agent";
};

const demoAssignees: DemoAssignee[] = [
  {
    id: "person-1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    type: "person",
  },
  {
    id: "person-2",
    name: "Alex Morgan",
    email: "alex@example.com",
    type: "person",
  },
  {
    id: "person-3",
    name: "Jordan Lee",
    email: "jordan@example.com",
    type: "person",
  },
  {
    id: "agent-1",
    name: "AI Assistant",
    email: "Agent",
    type: "agent",
  },
  {
    id: "agent-2",
    name: "Writing Assistant",
    email: "Agent",
    type: "agent",
  },
];

function AssigneeRow({
  selected,
  onToggle,
  assignee,
}: {
  selected: boolean;
  onToggle: () => void;
  assignee: DemoAssignee;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
      <Avatar className="size-6">
        <AvatarImage src={assignee.avatar} alt={`${assignee.name} avatar`} />
        <AvatarFallback className="text-xs">
          {assignee.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">
          {assignee.name}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {assignee.email}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="ml-auto h-7 px-2 text-xs"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        {selected ? "Remove" : "Add"}
      </Button>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-2 text-sm font-medium border-b-2 -mb-px",
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function TaskAssigneeCell({
  task,
  onUpdate,
}: TaskAssigneeCellProps) {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"people" | "agents">("people");

  const assigneeIds = task.assigneeIds ?? [];

  const assignedAssignees = demoAssignees.filter((assignee) =>
    assigneeIds.includes(assignee.id),
  );

  const toggle = (id: string) => {
    onUpdate(
      assigneeIds.includes(id)
        ? assigneeIds.filter((currentId) => currentId !== id)
        : [...assigneeIds, id],
    );
  };

  const visibleAssignees = demoAssignees.filter((assignee) =>
    tab === "people"
      ? assignee.type === "person"
      : assignee.type === "agent",
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full cursor-pointer justify-start gap-2 px-0! py-1 text-xs text-muted-foreground hover:bg-transparent items-center",
            assignedAssignees.length > 0 && "text-foreground",
          )}
        >
          {assignedAssignees.length > 0 ? (
            <div className="flex items-center gap-1">
              {assignedAssignees.slice(0, 2).map((assignee) => (
                <Avatar key={assignee.id} className="size-5">
                  <AvatarImage
                    src={assignee.avatar}
                    alt={`${assignee.name} avatar`}
                  />
                  <AvatarFallback className="text-[10px]">
                    {assignee.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}

              {assignedAssignees.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{assignedAssignees.length - 2}
                </span>
              )}
            </div>
          ) : (
            <UserPlus className="size-4" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="grid grid-cols-2 border-b">
          <TabButton
            active={tab === "people"}
            onClick={() => setTab("people")}
          >
            People
          </TabButton>

          <TabButton
            active={tab === "agents"}
            onClick={() => setTab("agents")}
          >
            Agents
          </TabButton>
        </div>

        <div className="max-h-64 overflow-y-auto p-2">
          {visibleAssignees.map((assignee) => (
            <AssigneeRow
              key={assignee.id}
              assignee={assignee}
              selected={assigneeIds.includes(assignee.id)}
              onToggle={() => toggle(assignee.id)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
