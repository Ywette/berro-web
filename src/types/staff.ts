export const EMPLOYEE_ROLES = [
  "driver",
  "dispatcher",
  "office",
  "mechanic",
  "other",
] as const;

export const DRIVER_STATUSES = [
  "available",
  "on_trip",
  "off_duty",
  "unavailable",
] as const;

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];
export type DriverStatus = (typeof DRIVER_STATUSES)[number];

export type Employee = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: EmployeeRole;
  isActive: boolean;
};

export type DriverAvailability = {
  id: string;
  fullName: string;
  phone: string | null;
  status: DriverStatus;
  note: string | null;
  updatedAt: string | null;
};

const roleLabels: Record<EmployeeRole, string> = {
  driver: "Driver",
  dispatcher: "Dispatcher",
  office: "Office",
  mechanic: "Mechanic",
  other: "Other",
};

const statusLabels: Record<DriverStatus, string> = {
  available: "Available",
  on_trip: "On a trip",
  off_duty: "Off duty",
  unavailable: "Unavailable",
};

export function isEmployeeRole(value: string): value is EmployeeRole {
  return EMPLOYEE_ROLES.some((role) => role === value);
}

export function isDriverStatus(value: string): value is DriverStatus {
  return DRIVER_STATUSES.some((status) => status === value);
}

export function labelForRole(role: EmployeeRole) {
  return roleLabels[role];
}

export function labelForStatus(status: DriverStatus) {
  return statusLabels[status];
}
