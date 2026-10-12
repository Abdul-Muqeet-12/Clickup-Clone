"use client";

import * as React from "react";
import {
  ChevronDown,
  CheckSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  CalendarDays,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { cn } from "@/lib/utils";

import { defaultStatuses } from "@/features/tasks/lib/constants";
import { TaskDialog, type DemoTask } from "./task-dialog";

type TaskListViewProps = {
  listId: string;
};

const initialDemoTasks: DemoTask[] = [
  {
    _id: "demo-task-1",
    title: "Plan project requirements",
    description: "Prepare the initial requirements and project scope.",
    status: "todo",
    priority: "high",
    assigneeIds: ["person-1"],
  },
  {
    _id: "demo-task-2",
    title: "Design dashboard layout",
    description: "Create the main dashboard layout.",
    status: "todo",
    priority: "normal",
    assigneeIds: ["person-2"],
  },
  {
    _id: "demo-task-3",
    title: "Build task components",
    description: "Implement task cards and board columns.",
    status: "in-progress",
    priority: "urgent",
    assigneeIds: ["agent-1"],
  },
];

const demoAssignees: Record<string, string> = {
  "person-1": "Sarah Johnson",
  "person-2": "Alex Morgan",
  "person-3": "Jordan Lee",
  "agent-1": "AI Assistant",
  "agent-2": "Writing Assistant",
};

function formatDate(timestamp?: number) {
  if (timestamp === undefined) return "No due date";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "No due date";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPriorityLabel(priority?: DemoTask["priority"]) {
  if (!priority) return "None";

  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export default function TaskListView({ listId }: TaskListViewProps) {
  const [tasks, setTasks] = React.useState<DemoTask[]>(() =>
    initialDemoTasks.map((task) => ({ ...task, listId })),
  );

  const [collapsed, setCollapsed] = React.useState<
    Record<string, boolean>
  >({});

  const [editingTask, setEditingTask] =
    React.useState<DemoTask | null>(null);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const [deletingTask, setDeletingTask] =
    React.useState<DemoTask | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    React.useState(false);

  const visibleStatuses = defaultStatuses.filter(
    (status) => status.id !== "complete",
  );

  const statusesWithTasks = visibleStatuses.map((status) => ({
    status,
    tasks: tasks.filter((task) => task.status === status.id),
  }));

  const toggleStatus = (statusId: string) => {
    setCollapsed((previous) => ({
      ...previous,
      [statusId]: !previous[statusId],
    }));
  };

  const handleSaveTask = (savedTask: DemoTask) => {
    setTasks((currentTasks) => {
      const taskExists = currentTasks.some(
        (task) => task._id === savedTask._id,
      );

      if (taskExists) {
        return currentTasks.map((task) =>
          task._id === savedTask._id
            ? { ...task, ...savedTask }
            : task,
        );
      }

      return [...currentTasks, savedTask];
    });

    setEditingTask(null);
  };

  const handleDeleteTask = () => {
    if (!deletingTask) return;

    setTasks((currentTasks) =>
      currentTasks.filter(
        (task) => task._id !== deletingTask._id,
      ),
    );

    setIsDeleteDialogOpen(false);
    setDeletingTask(null);
  };

  const openCreateDialog = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (task: DemoTask) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="mt-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Tasks
          </h2>

          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="mr-1 size-4" />
            Add task
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <Empty>
              <EmptyMedia variant="icon">
                <CheckSquare className="size-6" />
              </EmptyMedia>

              <EmptyHeader>
                <EmptyTitle>No tasks yet</EmptyTitle>
                <EmptyDescription>
                  Get started by creating your first task in this list.
                </EmptyDescription>
              </EmptyHeader>

              <Button onClick={openCreateDialog}>
                <Plus className="mr-1 size-4" />
                Create task
              </Button>
            </Empty>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-8">
            {statusesWithTasks.map(({ status, tasks: statusTasks }) => {
              const isCollapsed = collapsed[status.id] ?? false;

              return (
                <section
                  key={status.id}
                  className="flex flex-col gap-2"
                >
                  <button
                    type="button"
                    onClick={() => toggleStatus(status.id)}
                    className="flex w-fit items-center gap-2 text-sm font-medium"
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        isCollapsed && "-rotate-90",
                      )}
                    />

                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-sm px-3 uppercase",
                        status.badgeClassName,
                      )}
                    >
                      {status.name}
                    </Badge>

                    <span className="text-xs text-muted-foreground">
                      {statusTasks.length}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-[700px] caption-bottom text-sm">
                        <thead className="sticky top-0 z-10 bg-background">
                          <tr className="border-b">
                            <th className="h-10 w-[35%] px-2 text-left font-medium">
                              Name
                            </th>

                            <th className="h-10 w-[22%] px-2 text-left font-medium">
                              Assignee
                            </th>

                            <th className="h-10 w-[20%] px-2 text-left font-medium">
                              Due date
                            </th>

                            <th className="h-10 w-[15%] px-2 text-left font-medium">
                              Priority
                            </th>

                            <th className="h-10 w-10" />
                          </tr>
                        </thead>

                        <tbody>
                          {statusTasks.map((task) => (
                            <tr
                              key={task._id}
                              className="border-b transition-colors hover:bg-muted/50"
                            >
                              <td className="p-2">
                                <button
                                  type="button"
                                  onClick={() => openEditDialog(task)}
                                  className="max-w-full truncate text-left hover:underline"
                                >
                                  {task.title}
                                </button>

                                {task.description && (
                                  <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                                    {task.description}
                                  </p>
                                )}
                              </td>

                              <td className="p-2">
                                {task.assigneeIds.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    {task.assigneeIds.map((id) => (
                                      <span
                                        key={id}
                                        className="truncate text-sm"
                                      >
                                        {demoAssignees[id] ?? id}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">
                                    Unassigned
                                  </span>
                                )}
                              </td>

                              <td className="p-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <CalendarDays className="size-4 shrink-0 text-muted-foreground" />

                                  <span
                                    className={cn(
                                      !task.dueDate &&
                                        "text-muted-foreground",
                                    )}
                                  >
                                    {formatDate(task.dueDate)}
                                  </span>
                                </div>
                              </td>

                              <td className="p-2">
                                <Badge variant="outline">
                                  {getPriorityLabel(task.priority)}
                                </Badge>
                              </td>

                              <td className="p-2 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-muted-foreground"
                                      aria-label="Task actions"
                                    >
                                      <MoreHorizontal className="size-4" />
                                    </Button>
                                  </DropdownMenuTrigger>

                                  <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        openEditDialog(task)
                                      }
                                    >
                                      <Pencil className="size-4" />
                                      Edit task
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      variant="destructive"
                                      onSelect={() => {
                                        setDeletingTask(task);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="size-4" />
                                      Delete task
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {statusTasks.length === 0 && (
                        <p className="px-3 py-4 text-sm text-muted-foreground">
                          No tasks in this section.
                        </p>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);

          if (!open) {
            setEditingTask(null);
          }
        }}
        listId={listId}
        mode={editingTask ? "edit" : "create"}
        task={editingTask ?? undefined}
        taskId={editingTask?._id}
        onSave={handleSaveTask}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);

          if (!open) {
            setDeletingTask(null);
          }
        }}
        title="Delete task"
        description={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteTask}
      />
    </>
  );
}