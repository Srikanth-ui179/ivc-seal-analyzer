import type { RecordScope } from "@/lib/db/types";

export type DatasetVersionState = "draft" | "frozen";

export type SourceProvenanceSummary = {
  id: string;
  stableId: string;
  title: string;
  authors: string | null;
  publicationYear: number | null;
  publisherOrJournal: string | null;
  repositoryOrArchive: string | null;
  licenceName: string | null;
  licenceUrl: string | null;
  corpusScope: string | null;
  archaeologicalScope: string | null;
  catalogueSystem: string | null;
  transcriptionSystem: string | null;
  signNumberingConvention: string | null;
  limitations: string | null;
  notes: string | null;
};

export type DatasetSiteBreakdown = {
  siteId: string;
  siteStableId: string;
  canonicalName: string;
  modernRegion: string | null;
  country: string | null;
  latitude: string | null;
  longitude: string | null;
  inscriptionCount: number;
  occurrenceCount: number;
  distinctSignsCount: number;
  isCorpusSite: boolean;
};

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
  occurrenceCount?: number;
  distinctSignsCount?: number;
  corpusSitesCount?: number;
};

export type DatasetVersionInscription = {
  id: string;
  stableId: string;
  recordScope: RecordScope;
  surfaceLabel: string;
  objectStableId: string;
  objectType: string;
  siteName: string | null;
  siteStableId?: string | null;
};

export type DatasetVersionDetail = DatasetVersionSummary & {
  occurrenceCount: number;
  distinctSignsCount: number;
  corpusSitesCount: number;
  isMultiSite: boolean;
  sources: SourceProvenanceSummary[];
  sites: DatasetSiteBreakdown[];
  inscriptions: DatasetVersionInscription[];
};
