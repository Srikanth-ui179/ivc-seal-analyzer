import type { AnalysisResult, Inscription, Sign } from "./types";

export const signs: Sign[] = [
  { id: "M-001", glyph: "𐤀", frequency: 312, initial: 0.41, medial: 0.36, final: 0.23, related: ["M-018", "M-047"], description: "Single-stem form in the current reference set." },
  { id: "M-018", glyph: "◒", frequency: 286, initial: 0.14, medial: 0.67, final: 0.19, related: ["M-001", "M-064"], description: "Rounded sign form with a central division." },
  { id: "M-047", glyph: "✣", frequency: 194, initial: 0.58, medial: 0.29, final: 0.13, related: ["M-001", "M-083"], description: "Radiating mark with variable arm count in published corpora." },
  { id: "M-064", glyph: "𐄪", frequency: 171, initial: 0.09, medial: 0.32, final: 0.59, related: ["M-018", "M-091"], description: "Terminal-oriented form in the mock corpus." },
  { id: "M-083", glyph: "⌘", frequency: 143, initial: 0.37, medial: 0.51, final: 0.12, related: ["M-047", "M-091"], description: "Quadripartite sign form used for interface demonstration." },
  { id: "M-091", glyph: "⋔", frequency: 121, initial: 0.22, medial: 0.19, final: 0.59, related: ["M-064", "M-083"], description: "Angular terminal sign form in the mock corpus." },
];

export const inscriptions: Inscription[] = [
  { id: "H-202", glyphs: ["✣", "◒", "𐄪"], site: "Harappa", region: "Punjab", objectType: "Stamp seal", material: "Steatite", period: "Mature Harappan", context: "Surface collection; collection history recorded", note: "Metadata shown here is representative mock data for the prototype." },
  { id: "M-417", glyphs: ["𐤀", "◒", "⌘", "⋔"], site: "Mohenjo-daro", region: "Sindh", objectType: "Seal impression", material: "Clay", period: "Mature Harappan", context: "Excavated context, attribution pending source linkage", note: "Sequence notation is illustrative and not a translation." },
  { id: "L-089", glyphs: ["⌘", "◒", "𐄪"], site: "Lothal", region: "Gujarat", objectType: "Copper tablet", material: "Copper", period: "Mature Harappan", context: "Workshop-area association in mock record", note: "Object classification requires consultation with source catalogues." },
  { id: "D-154", glyphs: ["✣", "𐤀", "⋔"], site: "Dholavira", region: "Gujarat", objectType: "Pottery sherd", material: "Ceramic", period: "Late Harappan", context: "Stratigraphic context represented for interface testing", note: "No linguistic interpretation is implied." },
];

export const analysisResults: AnalysisResult[] = [
  { inscriptionId: "H-202", detected: [{ signId: "M-047", glyph: "✣", confidence: 0.93 }, { signId: "M-018", glyph: "◒", confidence: 0.89 }, { signId: "M-064", glyph: "𐄪", confidence: 0.91 }], sequence: ["M-047", "M-018", "M-064"], observations: ["The final sign occurs in the terminal position in 59% of this mock corpus sample.", "The first two signs co-occur in 12 records in the reference subset.", "The observed sequence length is close to the mock corpus median of three signs."] },
  { inscriptionId: "M-417", detected: [{ signId: "M-001", glyph: "𐤀", confidence: 0.88 }, { signId: "M-018", glyph: "◒", confidence: 0.92 }, { signId: "M-083", glyph: "⌘", confidence: 0.84 }, { signId: "M-091", glyph: "⋔", confidence: 0.87 }], sequence: ["M-001", "M-018", "M-083", "M-091"], observations: ["The terminal sign has a high final-position rate in the mock data.", "This four-sign pattern is uncommon in the current illustrative set.", "Results are pattern observations, not a linguistic reading."] },
];

export const principles = [
  { title: "Provenance first", text: "Every record is designed to retain site, object, material, dating, and source context alongside a sign sequence." },
  { title: "Observation is not interpretation", text: "Frequency, position, and co-occurrence are presented as computational measurements—not translations or decipherment claims." },
  { title: "Hypotheses remain inspectable", text: "Any future model-generated suggestion will be isolated, labeled, and linked to the evidence used to produce it." },
];
