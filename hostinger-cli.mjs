import fs from "node:fs";
import path from "node:path";

const API_TOKEN = process.env.HOSTINGER_API_TOKEN || "4O8dO4jxYbOBatvWDFDbWoZbwhvv9XFHGnHX8Ag50975914e";
const BASE_URL = "https://developers.hostinger.com";

const headers = {
  Authorization: `Bearer ${API_TOKEN}`,
  "Content-Type": "application/json",
  "User-Agent": "hostinger-direct-cli/1.0.0"
};

function showHelp() {
  console.log(`
Hostinger Direct CLI (Zero-Dependency)
=====================================
Usage:
  hostinger list
  hostinger deploy <domain> <zipPath> [removeArchive=false]
`);
}

async function listWebsites() {
  try {
    const res = await fetch(`${BASE_URL}/api/hosting/v1/websites`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("List failed:", error.message);
    process.exit(1);
  }
}

async function resolveUsername(domain) {
  const url = `${BASE_URL}/api/hosting/v1/websites?domain=${encodeURIComponent(domain)}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const websites = data?.data;
  if (!websites || websites.length === 0) {
    throw new Error(`No website found for domain: ${domain}`);
  }
  return websites[0].username;
}

async function fetchUploadCredentials(username, domain) {
  const url = `${BASE_URL}/api/hosting/v1/files/upload-urls`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ username, domain })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return await res.json();
}

async function uploadFileZeroDep(filePath, relativePath, uploadUrl, authRestToken, authToken) {
  const stats = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  
  const cleanUploadUrl = uploadUrl.replace(/\/$/, "");
  const uploadUrlWithFile = `${cleanUploadUrl}/${relativePath}?override=true`;

  const preUploadHeaders = {
    "X-Auth": authToken,
    "X-Auth-Rest": authRestToken,
    "upload-length": stats.size.toString(),
    "upload-offset": "0"
  };

  // 1. Pre-upload POST
  console.log("  Initiating upload session...");
  const preRes = await fetch(uploadUrlWithFile, {
    method: "POST",
    headers: preUploadHeaders
  });
  if (!preRes.ok && preRes.status !== 201) {
    throw new Error(`Pre-upload request failed: HTTP ${preRes.status} ${await preRes.text()}`);
  }

  // 2. TUS PATCH request for binary upload
  console.log("  Uploading file binary...");
  const uploadHeaders = {
    "X-Auth": authToken,
    "X-Auth-Rest": authRestToken,
    "Content-Type": "application/offset+octet-stream",
    "Upload-Offset": "0",
    "Tus-Resumable": "1.0.0"
  };

  const patchRes = await fetch(uploadUrlWithFile, {
    method: "PATCH",
    headers: uploadHeaders,
    body: fileBuffer
  });

  if (!patchRes.ok) {
    throw new Error(`PATCH upload failed: HTTP ${patchRes.status} ${await patchRes.text()}`);
  }
  return uploadUrlWithFile;
}

async function triggerDeploy(username, domain, archiveName) {
  const url = `${BASE_URL}/api/hosting/v1/accounts/${username}/websites/${domain}/deploy`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ archive_path: archiveName })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return await res.json();
}

async function deployWebsite(domain, zipPath, removeArchive = false) {
  const absolutePath = path.resolve(zipPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const archiveName = path.basename(absolutePath);
  
  try {
    console.log(`[1/5] Resolving username for ${domain}...`);
    const username = await resolveUsername(domain);
    console.log(`  Resolved username: ${username}`);

    console.log(`[2/5] Fetching upload credentials...`);
    const creds = await fetchUploadCredentials(username, domain);
    const { url: uploadUrl, auth_key: authToken, rest_auth_key: authRestToken } = creds;

    console.log(`[3/5] Uploading ${archiveName} (${fs.statSync(absolutePath).size} bytes)...`);
    await uploadFileZeroDep(absolutePath, archiveName, uploadUrl, authRestToken, authToken);
    console.log("  Upload successful!");

    console.log(`[4/5] Triggering deployment...`);
    const deployResult = await triggerDeploy(username, domain, archiveName);
    console.log("  Deployment triggered successfully:", deployResult);

    if (removeArchive) {
      console.log(`[5/5] Removing local archive...`);
      fs.unlinkSync(absolutePath);
      console.log("  Local archive removed.");
    }
  } catch (error) {
    console.error("Deployment failed:", error.message);
    process.exit(1);
  }
}

const [,, command, ...args] = process.argv;

if (command === "list") {
  listWebsites();
} else if (command === "deploy" && args.length >= 2) {
  const [domain, zipPath, removeArchive] = args;
  deployWebsite(domain, zipPath, removeArchive === "true");
} else {
  showHelp();
}
