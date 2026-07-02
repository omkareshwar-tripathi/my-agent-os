# Atlas Hub

One dashboard for every repo on this machine: status, vision, progress, and a
thought inbox — served locally, derived live from each repo's git + markdown.
Personal data (registry, thoughts, cache) lives in a separate PRIVATE repo
(`~/atlas-data`), never here.

## Run it

    node atlas/server.js     # → http://127.0.0.1:7843

Zero dependencies (Node 18+). Tests: `node --test atlas/test/`.
