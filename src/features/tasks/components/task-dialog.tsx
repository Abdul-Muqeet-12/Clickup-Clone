"use client";

import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Flag,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import {
  defaultStatuses,
  priorityOptions,
} from "../lib/constants";

import type { TaskFormValues } from "../lib/types";

// Frontend-only task type. No Convex/backend fields required.
export type DemoTask = {
  _id: string;
  listId?: string;
  title: string;
  description?: string;
  status: string;
  priority?: "low" | "normal" | "high" | "urgent";
  assigneeIds: string[];
  startDate?: number;
  dueDate?: number;
};

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  mode?: "create" | "edit";
  task?: DemoTask;
  taskId?: string;
  defaultStatus?: TaskFormValues["status"];
  onSave?: (task: DemoTask) => void;
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
        "mb-px border-b-2 px-3 py-2 text-sm font-medium",
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function AssigneeOption({
  selected,
  onClick,
  assignee,
}: {
  selected: boolean;
  onClick: () => void;
  assignee: DemoAssignee;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
        selected && "bg-accent",
      )}
    >
      <Avatar className="size-7">
        <AvatarImage src={assignee.avatar} />
        <AvatarFallback>
          {assignee.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col text-left">
        <span className="truncate text-sm font-medium">
          {assignee.name}
        </span>

        <span className="truncate text-xs text-muted-foreground">
          {assignee.email}
        </span>
      </div>

      {selected && (
        <span className="text-xs text-muted-foreground">✓</span>
      )}
    </button>
  );
}

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value === "number" || typeof value === "string") {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}

export function TaskDialog({
  open,
  onOpenChange,
  listId,
  mode = "create",
  task,
  taskId,
  defaultStatus,
  onSave,
}: TaskDialogProps) {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("todo");
  const [priority, setPriority] = useState<string>("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const [assigneesOpen, setAssigneesOpen] = useState(false);
  const [assigneeTab, setAssigneeTab] = useState<"people" | "agents">(
    "people",
  );
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setStatus(task?.status ?? defaultStatus ?? "todo");
    setPriority(task?.priority ?? "");
    setAssigneeIds((task?.assigneeIds ?? []).map(String));
    setStartDate(toDate(task?.startDate));
    setDueDate(toDate(task?.dueDate));

    setAssigneesOpen(false);
    setAssigneeTab("people");
    setStartDateOpen(false);
    setDueDateOpen(false);
  }, [open, task, defaultStatus]);

  const visibleAssignees = demoAssignees.filter((assignee) =>
    assigneeTab === "people"
      ? assignee.type === "person"
      : assignee.type === "agent",
  );

  const assignedPeople = demoAssignees.filter((assignee) =>
    assigneeIds.includes(assignee.id),
  );

  const toggleAssignee = (id: string) => {
    setAssigneeIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a task title.");
      return;
    }

    if (isEdit && !(taskId || task?._id)) {
      toast.error("Task ID is missing.");
      return;
    }

    const savedTask: DemoTask = {
      ...(task ?? {}),
      _id: isEdit
        ? taskId ?? task!._id
        : `demo-task-${Date.now()}`,
      listId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority: priority
        ? (priority as DemoTask["priority"])
        : undefined,
      assigneeIds,
      startDate: startDate?.getTime(),
      dueDate: dueDate?.getTime(),
    };

    setIsSubmitting(true);

    try {
      onSave?.(savedTask);

      toast.success(
        isEdit
          ? "Demo: Task updated successfully."
          : "Demo: Task created successfully.",
      );

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save demo task:", error);
      toast.error("Unable to save the task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Task" : "Create Task"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Update the task details below."
              : "Add a new task to this list. Fill in the details below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="task-title">
              Title <span className="text-destructive">*</span>
            </FieldLabel>

            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter task title"
              autoFocus
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="task-description">
              Description
            </FieldLabel>

            <Textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a description..."
              rows={3}
            />
          </Field>

          <Field className="w-full">
            <FieldLabel htmlFor="task-status">Status</FieldLabel>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="task-status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                {defaultStatuses.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field className="w-full">
              <FieldLabel htmlFor="task-priority">
                Priority
              </FieldLabel>

              <Select
                value={priority}
                onValueChange={setPriority}
              >
                <SelectTrigger id="task-priority" className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>

                <SelectContent>
                  {priorityOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      <div className="flex items-center gap-2">
                        <Flag
                          className={cn("size-4", item.flagColor)}
                        />
                        <span>{item.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field className="w-full">
              <FieldLabel>Assignees</FieldLabel>

              <Popover
                open={assigneesOpen}
                onOpenChange={setAssigneesOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    type="button"
                  >
                    <span className="truncate">
                      {assignedPeople.length
                        ? `${assignedPeople.length} selected`
                        : "Select assignees"}
                    </span>

                    <ChevronDown className="size-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-80 p-0"
                  align="start"
                >
                  <div className="grid grid-cols-2 border-b">
                    <TabButton
                      active={assigneeTab === "people"}
                      onClick={() => setAssigneeTab("people")}
                    >
                      People
                    </TabButton>

                    <TabButton
                      active={assigneeTab === "agents"}
                      onClick={() => setAssigneeTab("agents")}
                    >
                      Agents
                    </TabButton>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-2">
                    {visibleAssignees.map((assignee) => (
                      <AssigneeOption
                        key={assignee.id}
                        assignee={assignee}
                        selected={assigneeIds.includes(assignee.id)}
                        onClick={() => toggleAssignee(assignee.id)}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="Start Date"
              placeholder="Pick start date"
              value={startDate}
              open={startDateOpen}
              onOpenChange={setStartDateOpen}
              onChange={setStartDate}
            />

            <DatePicker
              label="Due Date"
              placeholder="Pick due date"
              value={dueDate}
              open={dueDateOpen}
              onOpenChange={setDueDateOpen}
              onChange={setDueDate}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save Changes"
                  : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type DatePickerProps = {
  value: Date | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (date: Date | undefined) => void;
  label: string;
  placeholder: string;
};

function DatePicker({
  value,
  open,
  onOpenChange,
  onChange,
  label,
  placeholder,
}: DatePickerProps) {
  return (
    <Field className="w-full">
      <FieldLabel>{label}</FieldLabel>

      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
            type="button"
          >
            <CalendarIcon className="mr-2 size-4" />

            {value ? (
              value.toLocaleDateString()
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);

              if (date) {
                onOpenChange(false);
              }
            }}
            defaultMonth={value}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
