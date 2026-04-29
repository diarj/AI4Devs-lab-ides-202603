export interface CandidateDocumentProps {
  id: string;
  candidateId: string;
  documentType: 'CV';
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  uploadedAt: Date;
}

export class CandidateDocument {
  constructor(public readonly props: CandidateDocumentProps) {}
}
