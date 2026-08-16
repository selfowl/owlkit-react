/** Match and filter connectors by id, name, or alias. */
const ALIASES: Record<string, string[]> = {
  metamask: ["io.metamask", "io.metamask.mobile", "metaMask", "metaMaskSDK"],
  rabby: ["io.rabby", "rabby"],
  coinbase: ["com.coinbase.wallet", "coinbaseWalletSDK"],
  rainbow: ["me.rainbow"],
  brave: ["com.brave.wallet"],
  okx: ["com.okex.wallet"],
  phantom: ["app.phantom"],
  injected: ["injected"],
  walletconnect: ["walletConnect"],
  wc: ["walletConnect"],
  tronlink: ["tronLink", "tronlink", "TronLink"],
};

export type WalletLike = {
  id: string;
  name: string;
  type: string;
  uid: string;
};

export function matchesWallet(wallet: WalletLike, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;

  if (wallet.id.toLowerCase() === needle) return true;
  if (wallet.uid.toLowerCase() === needle) return true;
  if (wallet.name.toLowerCase() === needle) return true;
  if (wallet.type.toLowerCase() === needle) return true;

  const aliases = ALIASES[needle] ?? [];
  return aliases.some((alias) => alias.toLowerCase() === wallet.id.toLowerCase());
}

export function uniqueWallets<T extends WalletLike>(wallets: readonly T[]) {
  const seen = new Set<string>();
  return wallets.filter((wallet) => {
    if (seen.has(wallet.uid)) return false;
    seen.add(wallet.uid);
    return true;
  });
}

export function filterWallets<T extends WalletLike>(
  wallets: readonly T[],
  include?: string[],
  exclude?: string[],
) {
  let next = uniqueWallets(wallets);

  if (include?.length) {
    next = next.filter((wallet) =>
      include.some((id) => matchesWallet(wallet, id)),
    );
  }

  if (exclude?.length) {
    next = next.filter(
      (wallet) => !exclude.some((id) => matchesWallet(wallet, id)),
    );
  }

  return next;
}
