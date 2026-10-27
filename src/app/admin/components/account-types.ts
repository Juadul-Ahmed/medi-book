
export type AccountRole = "PATIENT" | "DOCTOR";

export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  createdAt: string;
  isBlocked: boolean;
  blockedAt: string | null;
  blockedReason: string | null;
  doctorProfile: {
    id: string;
    approved: boolean;
    reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
    specialty: {
      name: string;
    };
  } | null;
};

export type AccountsResponse = {
  accounts: AdminAccount[];
  limit: number;
};
