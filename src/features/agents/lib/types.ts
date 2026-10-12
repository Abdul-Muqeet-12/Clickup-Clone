import { z } from "zod";

export const scheduleFormSchema = z
  .object({
    intervalValue: z.number({ error: "Required" }).min(1, "Must be at least 1"),
    intervalType: z.enum(["day", "week"]),
    daysOfWeek: z.array(z.number().min(0).max(6)),
    timeOfDay: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    timezone: z.string().min(1, "Timezone is required"),
    startDate: z.date(),
    endDate: z.date().optional(),
    instructions: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.intervalType === "week" && values.daysOfWeek.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["daysOfWeek"],
        message: "Select at least one day for weekly schedules",
      });
    }
  });

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;
