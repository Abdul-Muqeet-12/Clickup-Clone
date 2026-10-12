"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onValueChange?: (time: string) => void;
  defaultValue?: string;
  className?: string;
}

const pad = (n: number) => n.toString().padStart(2, "0");
const to12h = (h: number) => (h === 0 ? 12 : h > 12 ? h - 12 : h);
const toAmPm = (h: number) => (h < 12 ? "am" : "pm");

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const value = `${pad(hour)}:${pad(minute)}`;
  const label = `${to12h(hour)}:${pad(minute)} ${toAmPm(hour)}`;
  return { label, value };
});

export default function TimePicker({
  value,
  onValueChange,
  defaultValue,
  className,
}: TimePickerProps) {
  return (
    <Select
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        className={cn(
          "w-full justify-between font-normal shadow-none",
          className,
        )}
      >
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-60">
        {TIME_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
