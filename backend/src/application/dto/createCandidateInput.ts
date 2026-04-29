export interface CreateCandidateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  education: string | null;
  workExperience: string | null;
}
