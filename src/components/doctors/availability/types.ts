export type AvailabilityRule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type AvailabilityResponse = {
  rules: AvailabilityRule[];
  timezone: string;
};

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
