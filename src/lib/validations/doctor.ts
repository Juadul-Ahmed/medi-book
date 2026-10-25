
import { z } from "zod";

export const doctorRegistrationSchema = z.object({
  name: z.string().trim().min(2).max(100),

  email: z.string().trim().email().max(254),

  password: z.string().min(12).max(128),

  specialtyId: z.string().min(1, "Select a specialty."),

  licenseNumber: z.string().trim().min(3).max(100),

  bio: z.string().trim().max(2000).optional(),

  consultationFee: z.coerce.number().positive().finite(),

  timezone: z.string().min(1).default("UTC"),
});

export type DoctorRegistrationValues = z.infer<
  typeof doctorRegistrationSchema
>;

export const doctorProfileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  specialtyId: z.string().min(1, "Select a specialty."),
  bio: z.string().trim().max(2000),
  consultationFee: z.coerce.number().positive().finite(),
  timezone: z.string().trim().min(1).max(100),
});

export type DoctorProfileUpdateValues = z.infer<
  typeof doctorProfileUpdateSchema
>;
