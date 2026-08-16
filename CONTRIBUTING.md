# Contributing

## Setup

```bash
pnpm install
pnpm typecheck
pnpm build
```

This repository is `@owlkit/react` only. The published package is built from `src/` with tsup.

## Pull requests

1. Fork the repository and create a branch.
2. Keep the public surface typed and documented.
3. Open a pull request that says what changed and why.

## Scope

OwlKit is EVM-only. Browser wallets go through EIP-6963. WalletConnect is opt-in. Do not add non-EVM chains or a required backend.
