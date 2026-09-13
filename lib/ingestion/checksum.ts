import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

export function computeStringSha256(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export function computeJsonSha256(payload: Record<string, unknown>): string {
  const serialized = JSON.stringify(payload, Object.keys(payload).sort());
  return computeStringSha256(serialized);
}

export async function computeFileSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (err) => reject(err));
  });
}

export function isValidSha256(hash: string): boolean {
  return /^[0-9a-f]{64}$/i.test(hash);
}
