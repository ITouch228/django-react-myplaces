# Shared Jenkins controller lives in MyInventory; this image is ONLY an inbound agent.
FROM python:3.12-slim-bookworm AS python
FROM node:22-bookworm-slim AS node

FROM jenkins/inbound-agent:jdk21

USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy official Python 3.12 and Node 22 user-space runtimes into the agent.
COPY --from=python /usr/local /usr/local
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && python3.12 --version && node --version && npm --version

USER jenkins
