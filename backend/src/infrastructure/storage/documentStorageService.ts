import fs from 'fs/promises';
import path from 'path';

export interface CvUploadPayload {
  candidateId: string;
  buffer: Buffer;
  originalName: string;
}

export class LocalDocumentStorageService {
  constructor(private readonly rootDir: string) {}

  async uploadCv(payload: CvUploadPayload): Promise<{ storageKey: string }> {
    const safeName = path.basename(payload.originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const relativeDir = path.posix.join('candidates', payload.candidateId);
    const absDir = path.join(this.rootDir, ...relativeDir.split('/'));
    await fs.mkdir(absDir, { recursive: true });
    const storageKey = path.posix.join(relativeDir, `${Date.now()}_${safeName}`);
    const absFile = path.join(this.rootDir, ...storageKey.split('/'));
    await fs.writeFile(absFile, payload.buffer);
    return { storageKey };
  }

  async deleteByStorageKey(storageKey: string): Promise<void> {
    const absFile = path.join(this.rootDir, ...storageKey.split('/'));
    await fs.unlink(absFile).catch(() => undefined);
  }

  resolveAbsolutePath(storageKey: string): string {
    return path.join(this.rootDir, ...storageKey.split('/'));
  }
}

export function createLocalDocumentStorageFromEnv(): LocalDocumentStorageService {
  const root = process.env.CV_STORAGE_PATH || path.join(process.cwd(), 'uploads', 'cv');
  return new LocalDocumentStorageService(root);
}
