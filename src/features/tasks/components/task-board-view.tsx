
"use client";

import * as React from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DragStart,
  type DropResult,
} from "@hello-pangea/dnd";
import { Calendar, Flag, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus, StatusKey } from "@/features/tasks/lib/types";
import { formatTaskDate } from "@/features/tasks/lib/utils";
import { defaultStatuses, priorityOptions } from "@/features/tasks/lib/constants";
import { TaskDialog } from "./task-dialog";

type TaskBoardViewProps = {
  listId: string;
};

type DemoTask = {
  _id: string;
  title: string;
  description?: string;
  status: StatusKey;
  priority?: "high" | "low" | "normal" | "urgent";
  assigneeIds: string[];
  startDate?: number;
  dueDate?: number;
};

const initialDemoTasks: DemoTask[] = [
  {
    _id: "demo-task-1",
    title: "Plan project requirements",
    description: "Prepare the initial requirements and project scope.",
    status: "todo",
    priority: "high",
    assigneeIds: ["person-1"],
    startDate: undefined,
    dueDate: undefined,
  },
  {
    _id: "demo-task-2",
    title: "Design dashboard layout",
    description: "Create the main dashboard layout.",
    status: "todo",
    priority: "normal",
    assigneeIds: ["person-2"],
    startDate: undefined,
    dueDate: undefined,
  },
  {
    _id: "demo-task-3",
    title: "Build task components",
    description: "Implement the task card and board columns.",
    status: "in-progress",
    priority: "high",
    assigneeIds: ["agent-1"],
    startDate: undefined,
    dueDate: undefined,
  },
  {
    _id: "demo-task-4",
    title: "Review initial design",
    description: "Review the interface and list improvements.",
    status: "complete",
    priority: "low",
    assigneeIds: [],
    startDate: undefined,
    dueDate: undefined,
  },
];

export default function TaskBoardView({ listId }: TaskBoardViewProps) {
  const [tasks, setTasks] = React.useState<DemoTask[]>(initialDemoTasks);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<DemoTask | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [defaultStatus, setDefaultStatus] = React.useState<StatusKey>("todo");

  const tasksByStatus = React.useMemo(() => {
    const grouped: Record<StatusKey, DemoTask[]> = {
      todo: [],
      "in-progress": [],
      complete: [],
    };

    tasks.forEach((task) => {
      const status = task.status as StatusKey;
      if (grouped[status]) grouped[status].push(task);
    });

    return grouped;
  }, [tasks]);

  const handleDragStart = (_start: DragStart) => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);

    const { source, destination } = result;
    if (!destination) return;

    const sourceStatus = source.droppableId as StatusKey;
    const destinationStatus = destination.droppableId as StatusKey;

    if (
      sourceStatus === destinationStatus &&
      source.index === destination.index
    ) {
      return;
    }

    const updatedGroups: Record<StatusKey, DemoTask[]> = {
      todo: [...tasksByStatus.todo],
      "in-progress": [...tasksByStatus["in-progress"]],
      complete: [...tasksByStatus.complete],
    };

    const [movedTask] = updatedGroups[sourceStatus].splice(source.index, 1);
    if (!movedTask) return;

    const updatedTask: DemoTask = {
      ...movedTask,
      status: destinationStatus,
    };

    updatedGroups[destinationStatus].splice(destination.index, 0, updatedTask);

    setTasks([
      ...updatedGroups.todo,
      ...updatedGroups["in-progress"],
      ...updatedGroups.complete,
    ]);
  };

  const handleSaveTask = (savedTask: DemoTask) => {
    setTasks((current) => {
      const exists = current.some((task) => task._id === savedTask._id);

      if (exists) {
        return current.map((task) =>
          task._id === savedTask._id ? savedTask : task,
        );
      }

      return [...current, savedTask];
    });
  };

  return (
    <>
      <div className="flex h-full flex-col">
        <DragDropContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            className={cn(
              "flex flex-1 gap-4 overflow-x-auto pb-2",
              isDragging && "**:cursor-pointer",
            )}
          >
            {defaultStatuses.map((status: TaskStatus) => {
              const statusKey = status.id as StatusKey;

              return (
                <BoardColumn
                  key={status.id}
                  status={status}
                  tasks={tasksByStatus[statusKey]}
                  onAddTask={() => {
                    setEditingTask(null);
                    setDefaultStatus(statusKey);
                    setIsDialogOpen(true);
                  }}
                  onTaskClick={(task) => {
                    setEditingTask(task);
                    setIsDialogOpen(true);
                  }}
                />
              );
            })}
          </div>
        </DragDropContext>
      </div>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        listId={listId}
        mode={editingTask ? "edit" : "create"}
        task={editingTask ?? undefined}
        taskId={editingTask?._id}
        defaultStatus={editingTask ? undefined : defaultStatus}
      />
    </>
  );
}

type BoardColumnProps = {
  status: TaskStatus;
  tasks: DemoTask[];
  onAddTask: () => void;
  onTaskClick: (task: DemoTask) => void;
};

function BoardColumn({
  status,
  tasks,
  onAddTask,
  onTaskClick,
}: BoardColumnProps) {
  return (
    <div
      className={cn(
        "grid h-full max-h-full min-w-75 flex-1 grid-rows-[auto_1fr] rounded-lg p-2",
        status.columnClassName,
      )}
    >
      <div className="sticky top-0 mb-3 flex shrink-0 items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "rounded-sm border-transparent px-2 py-0.5 text-xs font-medium uppercase",
              status.badgeClassName,
            )}
          >
            {status.name}
          </Badge>
          <span className="text-xs text-muted-foreground">{tasks.length}</span>
        </div>
      </div>

      <Droppable droppableId={status.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-1",
              snapshot.isDraggingOver && "rounded-md bg-black/5",
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task)}
              />
            ))}

            {provided.placeholder}

            <Button
              variant="ghost"
              className="mt-1 w-full shrink-0 justify-start gap-2 text-muted-foreground hover:bg-black/5 hover:text-foreground"
              onClick={onAddTask}
            >
              <Plus className="size-4" />
              Add Task
            </Button>
          </div>
        )}
      </Droppable>
    </div>
  );
}

function TaskCard({
  task,
  index,
  onClick,
}: {
  task: DemoTask;
  index: number;
  onClick: () => void;
}) {
  const demoAssignees = [
    { id: "person-1", name: "Sarah Johnson", avatar: undefined },
    { id: "person-2", name: "Alex Morgan", avatar: undefined },
    { id: "person-3", name: "Jordan Lee", avatar: undefined },
    { id: "agent-1", name: "AI Assistant", avatar: undefined },
    { id: "agent-2", name: "Writing Assistant", avatar: undefined },
  ];

  const assigned = demoAssignees.filter((person) =>
    (task.assigneeIds ?? []).includes(person.id),
  );

  const priorityOption = task.priority
    ? priorityOptions.find((option) => option.value === task.priority)
    : null;

  const formattedDate = task.dueDate
    ? formatTaskDate(task.dueDate)
    : null;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => {
            if (!snapshot.isDragging) onClick();
          }}
          className="flex cursor-pointer flex-col gap-3 rounded-lg border bg-card p-3 text-foreground dark:bg-secondary"
        >
          <div className="text-sm font-medium leading-tight">
            {task.title}
          </div>

          {task.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {assigned.length > 0 && (
                <div className="flex items-center gap-1">
                  {assigned.slice(0, 2).map((person) => (
                    <Avatar key={person.id} className="size-5">
                      <AvatarImage src={person.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {person.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}

                  {assigned.length > 2 && (
                    <span className="text-xs font-medium">
                      +{assigned.length - 2}
                    </span>
                  )}
                </div>
              )}

              {formattedDate && (
                <div className="flex items-center gap-1 text-xs">
                  <Calendar className="size-3" />
                  <span>{formattedDate}</span>
                </div>
              )}
            </div>

            {priorityOption && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs",
                  priorityOption.flagColor,
                )}
              >
                <Flag className="size-3 fill-current" />
                <span className="font-medium">{priorityOption.label}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
