/** Kit instance: theme, wallet filters, wagmi config, modal open/close. */
import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
  type Config,
  type CreateConnectorFn,
} from "wagmi";
import { base, mainnet, sepolia, type Chain } from "wagmi/chains";
import { injected } from "wagmi/connectors/injected";
import { walletConnect } from "wagmi/connectors/walletConnect";
import { defaultLabels, defaultTheme, mergeTheme } from "./theme";
import type {
  OwlKitErrorHandler,
  OwlKitLabels,
  OwlKitOptions,
  OwlKitTheme,
  OwlKitWallet,
  WalletConnectSetup,
} from "./types";
import type { OwlKitHandlers } from "./events";
import { isUserRejection, toError } from "./errors";
import {
  getOwlBalance,
  getOwlToken,
  readOwlContract,
  writeOwlContract,
  type OwlKitBalanceRequest,
  type OwlKitContractCall,
} from "./actions";
import { filterWallets, matchesWallet, uniqueWallets, type WalletLike } from "./wallets";

const defaultChains = [mainnet, base, sepolia] as const;

export type OwlKitSnapshot = {
  theme: OwlKitTheme;
  labels: OwlKitLabels;
  logo?: string;
  include?: string[];
  exclude?: string[];
  inlineErrors: boolean;
};

export class OwlKit {
  appName: string;
  #theme: OwlKitTheme;
  #labels: OwlKitLabels;
  #logo?: string;
  #include?: string[];
  #exclude?: string[];
  #chains: readonly [Chain, ...Chain[]];
  #ssr: boolean;
  #injected: boolean;
  #walletConnect?: WalletConnectSetup;
  #extra: CreateConnectorFn[];
  #handlers: OwlKitHandlers = {};
  #inlineErrors: boolean;
  #config?: Config;
  #listeners = new Set<() => void>();
  #modalListeners = new Set<() => void>();
  #open = false;
  #snapshot: OwlKitSnapshot;

  constructor(options: OwlKitOptions = {}) {
    this.appName = options.appName ?? "owlkit";
    this.#theme = mergeTheme(defaultTheme, options.theme);
    this.#labels = { ...defaultLabels, ...options.labels };
    this.#logo = options.logo;
    this.#include = options.include;
    this.#exclude = options.exclude;
    this.#chains = options.chains ?? defaultChains;
    this.#ssr = options.ssr ?? true;
    this.#injected = options.injected ?? true;
    this.#walletConnect =
      options.walletConnect === false ? undefined : options.walletConnect;
    this.#extra = options.connectors ?? [];
    this.#handlers = {
      onConnecting: options.onConnecting,
      onConnect: options.onConnect,
      onReconnect: options.onReconnect,
      onDisconnect: options.onDisconnect,
      onAccountChange: options.onAccountChange,
      onChainChange: options.onChainChange,
      onError: options.onError,
    };
    this.#inlineErrors = options.inlineErrors ?? !options.onError;
    this.#snapshot = this.#read();
  }

  get theme() {
    return this.#theme;
  }

  get labels() {
    return this.#labels;
  }

  get logo() {
    return this.#logo;
  }

  get snapshot() {
    return this.#snapshot;
  }

  get inlineErrors() {
    return this.#inlineErrors;
  }

  get isOpen() {
    return this.#open;
  }

  open() {
    if (this.#open) return this;
    this.#open = true;
    for (const listener of this.#modalListeners) listener();
    return this;
  }

  close() {
    if (!this.#open) return this;
    this.#open = false;
    for (const listener of this.#modalListeners) listener();
    return this;
  }

  subscribeModal(listener: () => void) {
    this.#modalListeners.add(listener);
    return () => {
      this.#modalListeners.delete(listener);
    };
  }

  setTheme(theme: Partial<OwlKitTheme>) {
    this.#theme = mergeTheme(this.#theme, theme);
    return this.#touch();
  }

  setLabels(labels: Partial<OwlKitLabels>) {
    this.#labels = { ...this.#labels, ...labels };
    return this.#touch();
  }

  setLogo(logo?: string) {
    this.#logo = logo;
    return this.#touch();
  }

  show(...ids: string[]) {
    this.#include = ids;
    return this.#touch();
  }

  hide(...ids: string[]) {
    this.#exclude = ids;
    return this.#touch();
  }

  clearFilters() {
    this.#include = undefined;
    this.#exclude = undefined;
    return this.#touch();
  }

  useInjected(enabled = true) {
    this.#injected = enabled;
    this.#config = undefined;
    return this.#touch();
  }

  useWalletConnect(setup: WalletConnectSetup | false) {
    this.#walletConnect = setup === false ? undefined : setup;
    this.#config = undefined;
    return this.#touch();
  }

  setOnConnecting(handler?: OwlKitHandlers["onConnecting"]) {
    this.#handlers.onConnecting = handler;
    return this;
  }

  setOnConnect(handler?: OwlKitHandlers["onConnect"]) {
    this.#handlers.onConnect = handler;
    return this;
  }

  setOnReconnect(handler?: OwlKitHandlers["onReconnect"]) {
    this.#handlers.onReconnect = handler;
    return this;
  }

  setOnDisconnect(handler?: OwlKitHandlers["onDisconnect"]) {
    this.#handlers.onDisconnect = handler;
    return this;
  }

  setOnAccountChange(handler?: OwlKitHandlers["onAccountChange"]) {
    this.#handlers.onAccountChange = handler;
    return this;
  }

  setOnChainChange(handler?: OwlKitHandlers["onChainChange"]) {
    this.#handlers.onChainChange = handler;
    return this;
  }

  setOnError(handler?: OwlKitErrorHandler) {
    this.#handlers.onError = handler;
    return this;
  }

  emit<K extends keyof OwlKitHandlers>(
    event: K,
    ...args: Parameters<NonNullable<OwlKitHandlers[K]>>
  ) {
    const handler = this.#handlers[event] as
      | ((...next: typeof args) => void)
      | undefined;
    handler?.(...args);
    return this;
  }

  setInlineErrors(enabled: boolean) {
    this.#inlineErrors = enabled;
    return this.#touch();
  }

  reportError(error: unknown) {
    this.emit("onError", toError(error));
    return this;
  }

  isUserRejection(error: unknown) {
    return isUserRejection(error);
  }

  addConnector(connector: CreateConnectorFn) {
    this.#extra = [...this.#extra, connector];
    this.#config = undefined;
    return this.#touch();
  }

  getConfig() {
    this.#config ??= this.#createConfig();
    return this.#config;
  }

  async getBalance(parameters: OwlKitBalanceRequest = {}) {
    try {
      return await getOwlBalance(this.getConfig(), parameters);
    } catch (error) {
      this.reportError(error);
      throw error;
    }
  }

  async getToken(token: `0x${string}`, chainId?: number) {
    try {
      return await getOwlToken(this.getConfig(), { token, chainId });
    } catch (error) {
      this.reportError(error);
      throw error;
    }
  }

  async readContract(parameters: OwlKitContractCall) {
    try {
      return await readOwlContract(this.getConfig(), parameters);
    } catch (error) {
      this.reportError(error);
      throw error;
    }
  }

  async writeContract(parameters: OwlKitContractCall) {
    try {
      return await writeOwlContract(this.getConfig(), parameters);
    } catch (error) {
      this.reportError(error);
      throw error;
    }
  }

  list<T extends WalletLike>(wallets: readonly T[]) {
    return filterWallets(wallets, this.#include, this.#exclude);
  }

  wallet<T extends WalletLike>(id: string, wallets: readonly T[]) {
    return uniqueWallets(wallets).find((item) => matchesWallet(item, id));
  }

  providers<T extends WalletLike>(wallets: readonly T[]): OwlKitWallet[] {
    return this.list(wallets).map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      connector: {
        id: item.id,
        name: item.name,
        type: item.type,
        uid: item.uid,
      },
    }));
  }

  provider<T extends WalletLike>(id: string, wallets: readonly T[]) {
    const item = this.wallet(id, wallets);
    return item ? this.providers([item])[0] : undefined;
  }

  subscribe(listener: () => void) {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  #read(): OwlKitSnapshot {
    return {
      theme: this.#theme,
      labels: this.#labels,
      logo: this.#logo,
      include: this.#include,
      exclude: this.#exclude,
      inlineErrors: this.#inlineErrors,
    };
  }

  #touch() {
    this.#snapshot = this.#read();
    for (const listener of this.#listeners) listener();
    return this;
  }

  #createConfig() {
    const connectors: CreateConnectorFn[] = [];

    if (this.#injected) connectors.push(injected());

    if (this.#walletConnect?.projectId) {
      connectors.push(
        walletConnect({
          projectId: this.#walletConnect.projectId,
          showQrModal: this.#walletConnect.showQrModal ?? true,
          metadata: {
            name: this.#walletConnect.metadata?.name ?? this.appName,
            description:
              this.#walletConnect.metadata?.description ?? this.appName,
            url:
              this.#walletConnect.metadata?.url ??
              "https://github.com/selfowl/owlkit-react",
            icons: this.#walletConnect.metadata?.icons ?? [],
          },
        }),
      );
    }

    connectors.push(...this.#extra);

    if (!connectors.length) {
      throw new Error(
        "OwlKit: enable injected, pass walletConnect.projectId, or add connectors.",
      );
    }

    return createConfig({
      chains: this.#chains,
      connectors,
      multiInjectedProviderDiscovery: this.#injected,
      ssr: this.#ssr,
      storage: createStorage({ storage: cookieStorage }),
      transports: Object.fromEntries(
        this.#chains.map((chain) => [chain.id, http()]),
      ) as Record<number, ReturnType<typeof http>>,
    });
  }
}

export function createOwlKit(options?: OwlKitOptions) {
  return new OwlKit(options);
}
