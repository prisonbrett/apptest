// lib/GoogleSheets.ts
import { SignJWT, importPKCS8 } from "jose";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

function env(name: string) {
  return (
    process.env[`EXPO_PUBLIC_${name}` as any] ??
    process.env[name as any] ??
    ""
  );
}

async function getAccessToken() {
  const email = env("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  let key = env("GOOGLE_PRIVATE_KEY");
  if (!email || !key) {
    throw new Error(
      "Missing service account env. Set EXPO_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL and EXPO_PUBLIC_GOOGLE_PRIVATE_KEY."
    );
  }
  key = key.replace(/\\n/g, "\n");

  const privateKey = await importPKCS8(key, "RS256");
  const now = Math.floor(Date.now() / 1000);

  const jwt = await new SignJWT({ scope: SCOPES.join(" ") })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }).toString(),
  });

  if (!res.ok) throw new Error(`Token error ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return j.access_token as string;
}

export async function readSheetRange(sheetId: string, rangeA1: string) {
  const token = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
    rangeA1
  )}?valueRenderOption=UNFORMATTED_VALUE`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Sheets error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<{ range: string; values?: any[][] }>;
}