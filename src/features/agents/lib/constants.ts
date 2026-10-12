import { AlertCircle, BarChart3, ClipboardList } from "lucide-react";

export const SUGGESTED_AGENTS = [
  {
    title: "Daily Briefer",
    description: "Summarizes today's priorities and flags overdue items.",
    icon: BarChart3,
  },
  {
    title: "Priorities Manager",
    description: "Continuously manages priorities, identifying urgent tasks",
    icon: AlertCircle,
  },
  {
    title: "Triage New Tasks",
    description:
      "Reviews incoming tasks to prioritize, schedule, & automatically fill all details.",
    icon: ClipboardList,
  },
] as const;

export const DAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

export const MANUAL_TRIGGERS = [
  {
    key: "assignTask" as const,
    label: "Task Assignment",
    description: "When assigned a task",
    icon: ClipboardList,
  },
] as const;
