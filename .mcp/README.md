# 🤖 Local MCP Configuration

This project keeps MCP configuration local to the repository.

## Nx MCP

The root `.mcp.json` configures the Nx MCP server:

```json
{
  "servers": {
    "nx-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["nx", "mcp"]
    }
  }
}
```

Use this once the workspace is on Nx `21.4` or newer.

If the workspace uses an older Nx version, switch the server args to:

```json
["nx-mcp@latest"]
```

The Nx MCP server should be launched from the repository root so it can detect the workspace.
