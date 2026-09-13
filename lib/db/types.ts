export type RecordScope = "research" | "demo";
export type RecordStatus = "active" | "provisional" | "deprecated";
export type ScopeFilter = RecordScope | "all";

export type Pagination = {
  limit?: number;
  offset?: number;
};

export type Page<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export type SiteSummary = {
  id: string;
  stableId: string;
  recordScope: RecordScope;
  status: RecordStatus;
  canonicalName: string;
  modernRegion: string | null;
  country: string | null;
};

export type SiteDetail = SiteSummary & {
  latitude: string | null;
  longitude: string | null;
  coordinatePrecisionMeters: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ObjectSummary = {
  id: string;
  stableId: string;
  recordScope: RecordScope;
  status: RecordStatus;
  objectType: string;
  material: string | null;
  collectionName: string | null;
  collectionIdentifier: string | null;
  site: Pick<SiteSummary, "id" | "stableId" | "canonicalName" | "modernRegion" | "country"> | null;
};

export type ObjectDetail = ObjectSummary & {
  currentLocation: string | null;
  heightMm: string | null;
  widthMm: string | null;
  depthMm: string | null;
  diameterMm: string | null;
  conditionNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SignOccurrence = {
  id: string;
  stableId: string;
  recordScope: RecordScope;
  positionIndex: number;
  identificationStatus: "identified" | "tentative" | "unidentified" | "damaged";
  observedFormNote: string | null;
  orientationNote: string | null;
  sign: Pick<SignSummary, "id" | "stableId" | "catalogueNamespace" | "catalogueCode" | "visualLabel" | "glyphSvg"> | null;
};

export type SequenceSummary = {
  id: string;
  stableId: string;
  recordScope: RecordScope;
  status: RecordStatus;
  sequenceBasis: "source_transcription" | "editorial_normalization" | "alternative_reading";
  sequenceVersion: number;
  isPrimary: boolean;
  editorialNote: string | null;
  tokens: string[];
};

export type InscriptionSummary = {
  id: string;
  stableId: string;
  recordScope: RecordScope;
  status: RecordStatus;
  surfaceLabel: string;
  imageReference: string | null;
  imageRightsStatus: string | null;
  conditionNotes: string | null;
  object: Pick<ObjectSummary, "id" | "stableId" | "objectType" | "material">;
  site: ObjectSummary["site"];
  primarySequence: SequenceSummary | null;
};

export type InscriptionDetail = InscriptionSummary & {
  createdAt: Date;
  updatedAt: Date;
  sequences: Array<SequenceSummary & { occurrences: SignOccurrence[] }>;
};

export type SignSummary = {
  id: string;
  stableId: string;
  recordScope: RecordScope;
  status: RecordStatus;
  catalogueNamespace: string;
  catalogueCode: string;
  visualLabel: string;
  glyphSvg: string | null;
  frequency?: number;
};

export type SignOccurrenceDetail = {
  id: string;
  positionIndex: number;
  identificationStatus: string;
  inscriptionId: string;
  inscriptionStableId: string;
  surfaceLabel: string;
  objectStableId: string;
  objectId: string;
};

export type SignDetail = SignSummary & {
  visualDescription: string | null;
  imageReference: string | null;
  parentSign: Pick<SignSummary, "id" | "stableId" | "catalogueNamespace" | "catalogueCode" | "visualLabel"> | null;
  createdAt: Date;
  updatedAt: Date;
  occurrenceCount?: number;
  occurrences?: SignOccurrenceDetail[];
};

export type SignSequenceDetail = SequenceSummary & {
  inscription: Pick<InscriptionSummary, "id" | "stableId" | "surfaceLabel" | "recordScope">;
  occurrences: SignOccurrence[];
};

export type CatalogueIdentifierSummary = {
  catalogueNamespace: string;
  identifierText: string;
  sourceLocator: string | null;
  isPrimary: boolean;
};

export type CorpusStatistics = {
  totalInscriptions: number;
  researchInscriptions: number;
  totalObjects: number;
  totalSites: number;
  totalSignSequences: number;
  totalSignOccurrences: number;
  totalDistinctSigns: number;
  totalCatalogueIdentifiers: number;
  totalSources: number;
  releases: Array<{
    releaseLabel: string;
    deliveryVersion: string;
    providerName: string;
    rightsSummary: string | null;
  }>;
};
