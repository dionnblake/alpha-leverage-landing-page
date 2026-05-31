import { Client } from "file:///C:/Users/illpr/AppData/Roaming/npm/node_modules/hostinger-api-mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js";
import { StdioClientTransport } from "file:///C:/Users/illpr/AppData/Roaming/npm/node_modules/hostinger-api-mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js";

const transport = new StdioClientTransport({
  command: "C:/Program Files/nodejs/node.exe",
  args: [
    "C:/Users/illpr/AppData/Roaming/npm/node_modules/hostinger-api-mcp/src/servers/hosting.js",
    "--stdio"
  ],
  env: process.env
});

const client = new Client(
  { name: "hostinger-websites-lister", version: "1.0.0" },
  { capabilities: {} }
);

try {
  await client.connect(transport);
  const result = await client.callTool({
    name: "hosting_listWebsitesV1",
    arguments: { page: 1, per_page: 100 }
  });
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  try { await client.close(); } catch {}
}
