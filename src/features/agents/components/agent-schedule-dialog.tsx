"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import Timezone from "@/components/timezone";
import TimePicker from "@/components/time-picker";
import { cn } from "@/lib/utils";
import { scheduleFormSchema, ScheduleFormValues } from "../lib/types";
import { DAYS } from "../lib/constants";

interface AgentScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: Id<"agents">;
}

export function AgentScheduleDialog({
  open,
  onOpenChange,
  agentId,
}: AgentScheduleDialogProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  const createSchedule = useMutation(api.cronJobs.createAgentSchedule);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      intervalValue: 1,
      intervalType: "week",
      daysOfWeek: [],
      timeOfDay: "14:00",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      startDate: new Date(),
      endDate: undefined,
      instructions: "",
    },
  });

  const watchedValues = form.watch();

  async function onSubmit(values: ScheduleFormValues) {
    try {
      await createSchedule({
        agentId,
        intervalType: values.intervalType,
        intervalValue: values.intervalValue,
        daysOfWeek: values.daysOfWeek as (0 | 1 | 2 | 3 | 4 | 5 | 6)[],
        timeOfDay: values.timeOfDay,
        timezone: values.timezone,
        startDate: values.startDate.getTime(),
        endDate: values.endDate?.getTime(),
        instructions: values.instructions,
      });
      toast.success("Schedule created successfully");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create schedule");
      console.error(error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Schedule</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Every</Label>
                <div className="flex rounded-md border">
                  <FormField
                    control={form.control}
                    name="intervalValue"
                    render={({ field }) => (
                      <FormItem className="flex-1 min-w-0 border-0">
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            disabled={watchedValues.intervalType === "day"}
                            className="rounded-none border-0 border-r shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field}
                            value={
                              watchedValues.intervalType === "day"
                                ? 1
                                : field.value || ""
                            }
                            onChange={(e) => {
                              const value = parseInt(e.target.value, 10);
                              field.onChange(isNaN(value) ? 0 : value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="intervalType"
                    render={({ field }) => (
                      <FormItem className="min-w-0 flex-2">
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 rounded-none border-0 w-full shadow-none">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="week">Week</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {watchedValues.intervalType === "week" && (
                <FormField
                  control={form.control}
                  name="daysOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ToggleGroup
                          type="multiple"
                          value={field.value.map(String)}
                          onValueChange={(values) => {
                            field.onChange(values.map(Number));
                          }}
                          variant="outline"
                          spacing={0}
                          className="inline-flex w-full rounded-md border p-0"
                        >
                          {DAYS.map((day) => (
                            <ToggleGroupItem
                              key={day.value}
                              value={String(day.value)}
                              aria-label={`Toggle ${day.label}`}
                              className="flex-1 min-w-0 border-0 border-r"
                            >
                              {day.label}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Time Section */}
            <FormField
              control={form.control}
              name="timeOfDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>At</FormLabel>
                  <FormControl>
                    <TimePicker
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starts</FormLabel>
                  <Popover
                    open={datePickerOpen}
                    onOpenChange={setDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="size-4" />
                          {field.value ? (
                            field.value.toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <ChevronDown className="ml-auto size-4" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setDatePickerOpen(false);
                        }}
                        defaultMonth={field.value}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                    <Timezone
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ends</FormLabel>
                  <Popover
                    open={endDatePickerOpen}
                    onOpenChange={setEndDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="size-4" />
                          {field.value ? (
                            field.value.toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          ) : (
                            <span>No end date</span>
                          )}
                          <ChevronDown className="ml-auto size-4" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setEndDatePickerOpen(false);
                        }}
                        defaultMonth={field.value ?? new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your instructions here"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
