export type CreateCandidateFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: string;
  workExperience: string;
};

export type CandidateFormFieldKey = keyof CreateCandidateFormData;

export type CandidateFieldErrors = Partial<
  Record<CandidateFormFieldKey | 'cvFile', string>
>;

export const emptyCandidateForm: CreateCandidateFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  education: '',
  workExperience: '',
};
