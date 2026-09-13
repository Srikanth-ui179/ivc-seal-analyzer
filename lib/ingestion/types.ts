import type { RecordScope } from "@/lib/db/types";

export type IngestionAuthorizationStatus = "pending" | "authorized" | "restricted" | "withdrawn";
export type IngestionFileRole = "source_data" | "data_dictionary" | "licence_or_permission" | "documentation" | "other";
export type IngestionRunState = "staged" | "validated" | "promoted" | "rejected";

export type CorpusReleaseInput = {
  stableId: string;
  recordScope: RecordScope;
  sourceId: string;
  releaseLabel: string;
  deliveryVersion: string;
  providerName: string;
  authorizationStatus: IngestionAuthorizationStatus;
  receivedAt?: Date;
  permissionReference?: string;
  rightsSummary?: string;
  dataDictionaryReference?: string;
};

export type CorpusReleaseFileInput = {
  corpusReleaseId: string;
  originalFilename: string;
  fileRole: IngestionFileRole;
  mediaType?: string;
  privateStorageLocator: string;
  sha256: string;
  byteSize?: number;
};

export type IngestionRunInput = {
  stableId: string;
  recordScope: RecordScope;
  corpusReleaseId: string;
  importerVersion: string;
  manifestSha256: string;
};

export type StagedRowInput = {
  corpusIngestionRunId: string;
  corpusReleaseFileId: string;
  sourceRowKey: string;
  rawPayload: Record<string, unknown>;
  rawPayloadSha256: string;
  parseStatus?: "unparsed" | "valid" | "quarantined";
  validationErrors?: Record<string, unknown> | null;
};

export type M77RawRecord = {
  text_number: number | string;
  site?: string;
  object_type?: string;
  material?: string;
  surface_label?: string;
  line_number?: number | string;
  field_symbol?: string;
  signs: string | number[];
  source_transcription?: string;
  [key: string]: unknown;
};

export type ParsedM77Row = {
  sourceRowKey: string;
  textNumber: number;
  siteName: string;
  siteCode: string;
  objectType: string;
  material: string | null;
  surfaceLabel: string;
  lineNumber: number;
  fieldSymbol: string | null;
  signs: Array<{
    positionIndex: number;
    rawToken: string;
    signCode: number | null;
    isDamaged: boolean;
    isUnidentified: boolean;
    modifier?: string;
  }>;
  sourceTranscription: string;
  rawPayload: Record<string, unknown>;
};

export type ValidationError = {
  field: string;
  message: string;
  code: string;
};

export type RowValidationResult = {
  sourceRowKey: string;
  isValid: boolean;
  parsedRow?: ParsedM77Row;
  errors: ValidationError[];
  warnings: string[];
};

export type PromotionResult = {
  ingestionRunId: string;
  promotedObjectsCount: number;
  promotedInscriptionsCount: number;
  promotedSequencesCount: number;
  promotedOccurrencesCount: number;
  promotedIdentifiersCount: number;
  promotedAssertionsCount: number;
  promotedAt: Date;
};

export type CisiRawGrapheme = {
  id: string;
  features?: number[];
};

export type CisiRawSide = {
  id: string;
  description?: string;
  graphemes: CisiRawGrapheme[];
};

export type ParsedCisiArtefact = {
  cisiId: string;
  artefactNum: string;
  sides: Array<{
    sideLabel: string;
    surfaceLabel: string;
    fullSideId: string;
    description: string;
    objectType: string;
    graphemes: Array<{
      signId: string;
      features: number[];
      positionIndex: number;
    }>;
    sourceTranscription: string;
  }>;
};
