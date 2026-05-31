import { Client } from "file:///C:/Users/illpr/AppData/Roaming/npm/node_modules/hostinger-api-mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js";
import { StdioClientTransport } from "file:///C:/Users/illpr/AppData/Roaming/npm/node_modules/hostinger-api-mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const archivePath = path.join(__dirname, "alpha-leverage-hostinger-deploy.zip");
const domain = "alphaleverage.alphastartsnow.com";

const transport = new StdioClientTransport({
  command: "C:/Program Files/nodejs/node.exe",
  args: [
    "C:/Users/illpr/AppData/Roaming/npm/node_modules/hostinger-api-mcp/src/servers/hosting.js",
    "--stdio"
  ],
  env: process.env
});

const client = new Client(
  {
    name: "alpha-leverage-deployer",
    version: "1.0.0"
  },
  {
    capabilities: {}
  }
);

try {
  await client.connect(transport);
  const result = await client.callTool({
    name: "hosting_deployStaticWebsite",
    arguments: {
      domain,
      archivePath,
      removeArchive: false
    }
  });

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  try {
    await client.close();
  } catch {}
}
