import type { RecordScope } from "@/lib/db/types";

export type DatasetVersionState = "draft" | "frozen";

export type DatasetVersionSummary = {
  id: string;
  stableId: string;
  recordScope: RecordScope;
  name: string;
  description: string | null;
  selectionCriteria: string;
  state: DatasetVersionState;
  frozenAt: Date | null;
  createdAt: Date;
  inscriptionCount: number;
};

export type DatasetVersionInscription = {
  id: string;
  stableId: string;
  recordScope: RecordScope;
  surfaceLabel: string;
  objectStableId: string;
  objectType: string;
  siteName: string | null;
};

export type DatasetVersionDetail = DatasetVersionSummary & {
  inscriptions: DatasetVersionInscription[];
};
