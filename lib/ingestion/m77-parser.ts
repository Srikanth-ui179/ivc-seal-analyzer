import type { M77RawRecord, ParsedM77Row } from "./types";

export const CANONICAL_SITES: Record<string, { canonicalName: string; modernRegion: string; country: string; latitude: string; longitude: string }> = {
  "MOHENJO-DARO": { canonicalName: "Mohenjo-daro", modernRegion: "Sindh", country: "Pakistan", latitude: "27.329400", longitude: "68.138900" },
  HARAPPA: { canonicalName: "Harappa", modernRegion: "Punjab", country: "Pakistan", latitude: "30.630000", longitude: "72.865000" },
  LOTHAL: { canonicalName: "Lothal", modernRegion: "Gujarat", country: "India", latitude: "22.522200", longitude: "72.249700" },
  KALIBANGAN: { canonicalName: "Kalibangan", modernRegion: "Rajasthan", country: "India", latitude: "29.473600", longitude: "74.131100" },
  CHANHUDARO: { canonicalName: "Chanhudaro", modernRegion: "Sindh", country: "Pakistan", latitude: "26.175000", longitude: "68.316700" },
  BANAWALI: { canonicalName: "Banawali", modernRegion: "Haryana", country: "India", latitude: "29.605000", longitude: "75.390000" },
  "KOT DIJI": { canonicalName: "Kot Diji", modernRegion: "Sindh", country: "Pakistan", latitude: "27.340000", longitude: "68.710000" },
  SURKOTADA: { canonicalName: "Surkotada", modernRegion: "Gujarat", country: "India", latitude: "23.620000", longitude: "70.830000" },
  ALLAHDINO: { canonicalName: "Allahdino", modernRegion: "Sindh", country: "Pakistan", latitude: "24.900000", longitude: "67.200000" },
  DESALPUR: { canonicalName: "Desalpur", modernRegion: "Gujarat", country: "India", latitude: "23.470000", longitude: "69.130000" },
  DHOLAVIRA: { canonicalName: "Dholavira", modernRegion: "Gujarat", country: "India", latitude: "23.886400", longitude: "70.213100" },
};

export function resolveSiteFromTextNumber(textNumber: number, explicitSite?: string): { siteName: string; siteCode: string } {
  if (explicitSite) {
    const normalized = explicitSite.trim().toUpperCase();
    for (const [code, info] of Object.entries(CANONICAL_SITES)) {
      if (normalized === code || normalized === info.canonicalName.toUpperCase()) {
        return { siteName: info.canonicalName, siteCode: code };
      }
    }
  }

  if (textNumber >= 1000 && textNumber < 2000) return { siteName: "Mohenjo-daro", siteCode: "MOHENJO-DARO" };
  if (textNumber >= 2000 && textNumber < 3000) return { siteName: "Harappa", siteCode: "HARAPPA" };
  if (textNumber >= 3000 && textNumber < 4000) return { siteName: "Lothal", siteCode: "LOTHAL" };
  if (textNumber >= 4000 && textNumber < 5000) return { siteName: "Kalibangan", siteCode: "KALIBANGAN" };
  if (textNumber >= 5000 && textNumber < 6000) return { siteName: "Chanhudaro", siteCode: "CHANHUDARO" };

  return { siteName: explicitSite?.trim() || "Other Indus Site", siteCode: explicitSite ? explicitSite.trim().toUpperCase().replace(/\s+/g, "_") : "OTHER" };
}

export function parseM77RawRecord(raw: M77RawRecord): ParsedM77Row {
  const textNumber = typeof raw.text_number === "number" ? raw.text_number : Number.parseInt(String(raw.text_number).trim(), 10);
  const surfaceLabel = String(raw.surface_label ?? "face-a").trim().toLowerCase();
  const lineNumber = typeof raw.line_number === "number" ? raw.line_number : Number.parseInt(String(raw.line_number ?? 1).trim(), 10) || 1;
  const sourceRowKey = `M77-${textNumber}-${surfaceLabel}-${lineNumber}`;

  const { siteName, siteCode } = resolveSiteFromTextNumber(textNumber, raw.site);

  // Normalize sign tokens
  const rawTokens: string[] = Array.isArray(raw.signs)
    ? raw.signs.map((s) => String(s).trim())
    : String(raw.signs ?? "")
        .trim()
        .split(/[\s,]+/)
        .filter(Boolean);

  const parsedSigns = rawTokens.map((token, idx) => {
    const positionIndex = idx + 1;
    const cleanToken = token.trim();
    const isDamaged = cleanToken === "999" || cleanToken === "0" || cleanToken.toUpperCase() === "[DAMAGED]" || cleanToken.toUpperCase() === "[X]";
    const isUnidentified = cleanToken === "998" || cleanToken.toUpperCase() === "[UNIDENTIFIED]";
    const num = Number.parseInt(cleanToken, 10);
    const isValidNumber = !Number.isNaN(num) && num >= 1 && num <= 419 && !isDamaged && !isUnidentified;

    return {
      positionIndex,
      rawToken: cleanToken,
      signCode: isValidNumber ? num : null,
      isDamaged,
      isUnidentified,
    };
  });

  const sourceTranscription = raw.source_transcription?.trim() || rawTokens.join(" ");

  return {
    sourceRowKey,
    textNumber,
    siteName,
    siteCode,
    objectType: String(raw.object_type ?? "seal").trim().toLowerCase(),
    material: raw.material ? String(raw.material).trim().toLowerCase() : null,
    surfaceLabel,
    lineNumber,
    fieldSymbol: raw.field_symbol ? String(raw.field_symbol).trim().toLowerCase() : null,
    signs: parsedSigns,
    sourceTranscription,
    rawPayload: raw as Record<string, unknown>,
  };
}

export function parseCsvRows(csvContent: string): M77RawRecord[] {
  const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith("#"));
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
  const records: M77RawRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const row: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? "";
    }
    records.push(row as unknown as M77RawRecord);
  }

  return records;
}
