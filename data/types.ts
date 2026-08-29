export type EvidenceClass = "Archaeological record" | "Computational observation" | "AI hypothesis";

export type Sign = {
  id: string;
  glyph: string;
  frequency: number;
  initial: number;
  medial: number;
  final: number;
  related: string[];
  description: string;
};

export type Inscription = {
  id: string;
  glyphs: string[];
  site: string;
  region: string;
  objectType: string;
  material: string;
  period: string;
  context: string;
  note: string;
};

export type AnalysisResult = {
  inscriptionId: string;
  detected: Array<{ signId: string; glyph: string; confidence: number }>;
  sequence: string[];
  observations: string[];
};
