export interface CandidateProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  education: string | null;
  workExperience: string | null;
  createdByUserId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Candidate {
  constructor(public readonly props: CandidateProps) {}

  get id(): string {
    return this.props.id;
  }
}
