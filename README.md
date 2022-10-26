# RTGS Cactus Minimal Example

This is a very example implementation of Cactus node for RTGS project.

## Explanation

This project has 2 entrypoints: `src/node.ts` to start a connector node, and `src/client.ts` to start a client or **business logic** service.

Currently there is no any business logic, only sample code. In `client.ts`, it is possible to communicate with the connector node and to use Transaction, Query and Block Stream API. These are available instruments to build your logic.

## Setup

1. Install latest Node.js:
2. Install PNPM:

   ```bash
   npm i -g pnpm
   ```

3. Install packages:

   ```bash
   pnpm i
   ```

## Configure

See `./config.example.json`. Place your own config into `config.json`.

### Start a node

**Start a connector node:**

```bash
pnpm start:node
```

**Start a "client" process which contains business logic**:

```bash
pnpm start:client
```
