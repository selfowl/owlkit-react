/** Constructor options, theme tokens, and wallet descriptors. */
import type { CreateConnectorFn } from "wagmi";
import type { Chain } from "wagmi/chains";
import type { OwlKitHandlers } from "./events";

export type OwlKitRadius = number | "pill";

export type OwlKitTheme = {
  accent: string;
  background: string;
  text: string;
  muted: string;
  border: string;
  button: string;
  buttonText: string;
  modal: string;
  wallet: string;
  overlay: string;
  overlayBlur?: number;
  error: string;
  font?: string;
  fontSize?: number;
  modalWidth?: number;
  radius: OwlKitRadius | {
    button?: OwlKitRadius;
    modal?: OwlKitRadius;
    wallet?: OwlKitRadius;
  };
  vars?: Record<string, string>;
};

export type OwlKitLabels = {
  connect: string;
  connecting: string;
  modalTitle: string;
  accountTitle: string;
  copyAddress: string;
  copied: string;
  disconnect: string;
  viewExplorer: string;
};

export type WalletConnectSetup = {
  projectId: string;
  showQrModal?: boolean;
  metadata?: {
    name?: string;
    description?: string;
    url?: string;
    icons?: string[];
  };
};

export type OwlKitErrorHandler = (error: Error) => void;

export type OwlKitOptions = OwlKitHandlers & {
  appName?: string;
  logo?: string;
  theme?: Partial<OwlKitTheme>;
  labels?: Partial<OwlKitLabels>;
  chains?: readonly [Chain, ...Chain[]];
  ssr?: boolean;
  injected?: boolean;
  walletConnect?: WalletConnectSetup | false;
  connectors?: CreateConnectorFn[];
  include?: string[];
  exclude?: string[];
  inlineErrors?: boolean;
};

export type OwlKitWallet = {
  id: string;
  name: string;
  type: string;
  connector: {
    id: string;
    name: string;
    type: string;
    uid: string;
  };
};
