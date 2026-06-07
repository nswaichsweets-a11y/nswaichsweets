import { createSign } from "node:crypto";

export type GoogleCloudStorageConfig = {
  bucketName: string;
  clientEmail: string;
  privateKey: string;
  projectId?: string;
  backupPrefix: string;
  ownerEmail: string;
};

export type GoogleCloudStorageStatus = {
  configured: boolean;
  missing: string[];
  bucketName: string;
  projectId: string;
  clientEmail: string;
  backupPrefix: string;
  ownerEmail: string;
};

export class GoogleCloudStorageConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleCloudStorageConfigError";
  }
}

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n").trim();
}

function base64Url(value: Buffer | string) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function getGoogleCloudStorageStatus(): GoogleCloudStorageStatus {
  const ownerEmail = process.env.GOOGLE_CLOUD_OWNER_EMAIL || "nswaichsweets@gmail.com";
  const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || "";
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "";
  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL || "";
  const backupPrefix = process.env.GOOGLE_CLOUD_BACKUP_PREFIX || "nss-backups";
  const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY || "";
  const missing = [
    ["GOOGLE_CLOUD_STORAGE_BUCKET", bucketName],
    ["GOOGLE_CLOUD_CLIENT_EMAIL", clientEmail],
    ["GOOGLE_CLOUD_PRIVATE_KEY", privateKey]
  ]
    .filter(([, value]) => !String(value).trim())
    .map(([key]) => key);

  return {
    configured: missing.length === 0,
    missing,
    bucketName,
    projectId,
    clientEmail,
    backupPrefix,
    ownerEmail
  };
}

export function getGoogleCloudStorageConfig(): GoogleCloudStorageConfig {
  const status = getGoogleCloudStorageStatus();
  if (!status.configured) {
    throw new GoogleCloudStorageConfigError(`Missing Google Cloud backup variables: ${status.missing.join(", ")}`);
  }

  return {
    bucketName: status.bucketName,
    clientEmail: status.clientEmail,
    privateKey: normalizePrivateKey(process.env.GOOGLE_CLOUD_PRIVATE_KEY || ""),
    projectId: status.projectId || undefined,
    backupPrefix: status.backupPrefix.replace(/^\/+|\/+$/g, "") || "nss-backups",
    ownerEmail: status.ownerEmail
  };
}

async function requestAccessToken(config: GoogleCloudStorageConfig) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iss: config.clientEmail,
      scope: "https://www.googleapis.com/auth/devstorage.read_write",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600
    })
  );
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");

  signer.update(unsignedToken);
  signer.end();

  const signature = base64Url(signer.sign(config.privateKey));
  const assertion = `${unsignedToken}.${signature}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Google Cloud token request failed: ${text}`);
  }

  const token = JSON.parse(text) as { access_token?: string };
  if (!token.access_token) throw new Error("Google Cloud token response did not include an access token.");
  return token.access_token;
}

export async function createGoogleCloudStorageUploader(config = getGoogleCloudStorageConfig()) {
  const accessToken = await requestAccessToken(config);

  return {
    config,
    async uploadObject({
      objectName,
      body,
      contentType
    }: {
      objectName: string;
      body: Buffer | string;
      contentType: string;
    }) {
      const url = new URL(`https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(config.bucketName)}/o`);
      url.searchParams.set("uploadType", "media");
      url.searchParams.set("name", objectName);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": contentType
        },
        body: body as BodyInit
      });
      const text = await response.text();

      if (!response.ok) {
        throw new Error(`Google Cloud upload failed for ${objectName}: ${text}`);
      }

      const result = JSON.parse(text) as { bucket?: string; name?: string; size?: string };
      return {
        bucket: result.bucket || config.bucketName,
        name: result.name || objectName,
        size: Number(result.size || 0)
      };
    }
  };
}
