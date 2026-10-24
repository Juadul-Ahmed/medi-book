
export type DoctorApplication = {
  id: string;
  licenseNumber: string;
  bio: string | null;
  consultationFee: string;
  timezone: string;
  reviewStatus: "PENDING";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  specialty: {
    id: string;
    name: string;
  };
};
