# Graph Report - Alpha Leverage website landing page  (2026-05-28)

## Corpus Check
- 8 files · ~214,694 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 82 nodes · 78 edges · 8 communities (6 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d3070cd2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]

## God Nodes (most connected - your core abstractions)
1. `Alpha Leverage agent knowledge base` - 12 edges
2. `deployWebsite()` - 5 edges
3. `hostinger-api` - 3 edges
4. `resolveUsername()` - 2 edges
5. `fetchUploadCredentials()` - 2 edges
6. `uploadFileZeroDep()` - 2 edges
7. `triggerDeploy()` - 2 edges
8. `mcpServers` - 2 edges
9. `env` - 2 edges
10. `__filename` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (8 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (25): blobs, callsIn, canvas, card, cards, consent, contact, convIn (+17 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (12): Alpha Leverage agent knowledge base, Benefits to explain, Booking a demo, Conversational webchat mode, Guardrails, Human handoff, Offer, Opening message (+4 more)

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (6): deployWebsite(), fetchUploadCredentials(), headers, resolveUsername(), triggerDeploy(), uploadFileZeroDep()

### Community 3 - "Community 3"
Cohesion: 0.33
Nodes (4): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (5): archivePath, client, __dirname, __filename, transport

### Community 5 - "Community 5"
Cohesion: 0.33
Nodes (5): APITOKEN, command, env, mcpServers, hostinger-api

## Knowledge Gaps
- **52 isolated node(s):** `__filename`, `__dirname`, `archivePath`, `transport`, `client` (+47 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `__filename`, `__dirname`, `archivePath` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._