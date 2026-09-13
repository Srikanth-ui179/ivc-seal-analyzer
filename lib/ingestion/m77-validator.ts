import { parseM77RawRecord } from "./m77-parser";
import type { M77RawRecord, ParsedM77Row, RowValidationResult, ValidationError } from "./types";

export function validateParsedM77Row(row: ParsedM77Row): RowValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // 1. Text number validation
  if (!row.textNumber || Number.isNaN(row.textNumber) || row.textNumber < 1000 || row.textNumber > 9999) {
    errors.push({ field: "textNumber", message: `Invalid text number: ${row.textNumber}. Must be integer between 1000 and 9999.`, code: "INVALID_TEXT_NUMBER" });
  }

  // 2. Site validation
  if (!row.siteName || row.siteName.trim() === "") {
    errors.push({ field: "siteName", message: "Site name is required and cannot be resolved.", code: "MISSING_SITE" });
  }

  // 3. Object & surface validation
  if (!row.objectType || row.objectType.trim() === "") {
    errors.push({ field: "objectType", message: "Object type is required.", code: "MISSING_OBJECT_TYPE" });
  }

  if (!row.surfaceLabel || row.surfaceLabel.trim() === "") {
    errors.push({ field: "surfaceLabel", message: "Surface label is required.", code: "MISSING_SURFACE_LABEL" });
  }

  // 4. Source transcription validation
  if (!row.sourceTranscription || row.sourceTranscription.trim() === "") {
    errors.push({ field: "sourceTranscription", message: "Source transcription is required for source-recorded sequences.", code: "MISSING_SOURCE_TRANSCRIPTION" });
  }

  // 5. Sign sequence validation
  if (!row.signs || row.signs.length === 0) {
    errors.push({ field: "signs", message: "Sequence must contain at least one sign occurrence.", code: "EMPTY_SIGN_SEQUENCE" });
  } else {
    for (const sign of row.signs) {
      if (!sign.rawToken || sign.rawToken.trim() === "") {
        errors.push({ field: "signs", message: `Empty token at position ${sign.positionIndex}.`, code: "EMPTY_SIGN_TOKEN" });
      } else if (sign.signCode === null && !sign.isDamaged && !sign.isUnidentified) {
        errors.push({ field: "signs", message: `Unrecognized sign token '${sign.rawToken}' at position ${sign.positionIndex}. Must be integer 1..419 or damage marker (999/0).`, code: "INVALID_SIGN_CODE" });
      }
    }
  }

  // Warnings for missing optional archaeological details (non-blocking)
  if (!row.material) {
    warnings.push("Material not specified in source; defaulted to unknown.");
  }
  if (!row.fieldSymbol) {
    warnings.push("Field symbol/motif not recorded for this object.");
  }

  return {
    sourceRowKey: row.sourceRowKey,
    isValid: errors.length === 0,
    parsedRow: row,
    errors,
    warnings,
  };
}

export function validateRawM77Record(raw: M77RawRecord): RowValidationResult {
  try {
    const parsed = parseM77RawRecord(raw);
    return validateParsedM77Row(parsed);
  } catch (error) {
    return {
      sourceRowKey: String(raw.text_number ?? "UNKNOWN"),
      isValid: false,
      errors: [{ field: "rawRecord", message: error instanceof Error ? error.message : "Failed to parse raw M77 record", code: "PARSE_FAILURE" }],
      warnings: [],
    };
  }
}
