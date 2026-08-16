/** Public `@owlkit/react` surface. */
import "./styles.css";
export { OwlKit, createOwlKit } from "./kit";
export { OwlKitProvider } from "./provider";
export { ConnectButton } from "./connect-button";
export { OwlKitModal } from "./modal";
export { useOwlKit } from "./context";
export { useOwlBalance, useOwlToken } from "./hooks";
export { truncateAddress } from "./address";
export { isUserRejection } from "./errors";
export { defaultTheme, defaultLabels, defaultCssVars } from "./theme";
export type { OwlKitCssVar } from "./theme";
export { erc20Abi } from "viem";

export type {
  OwlKitOptions,
  OwlKitTheme,
  OwlKitLabels,
  OwlKitWallet,
  WalletConnectSetup,
  OwlKitErrorHandler,
} from "./types";
export type {
  OwlKitAccount,
  OwlKitAccountChangeEvent,
  OwlKitChainChangeEvent,
  OwlKitConnectEvent,
  OwlKitHandlers,
} from "./events";
export type {
  OwlKitBalance,
  OwlKitBalanceRequest,
  OwlKitContractCall,
  OwlKitToken,
} from "./actions";

export {
  useConnection,
  useAccount,
  useConnect,
  useConnectors,
  useDisconnect,
  useSignMessage,
  useSendTransaction,
  useReadContract,
  useWriteContract,
  cookieToInitialState,
} from "wagmi";

export type { Config, State } from "wagmi";
