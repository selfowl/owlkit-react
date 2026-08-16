/** Connect / account / chain event payloads. */
import type { Address, Chain } from "viem";

export type OwlKitAccount = {
  address: Address;
  addresses?: readonly Address[];
  chainId?: number;
  chain?: Chain;
  connector?: {
    id: string;
    name: string;
    uid: string;
  };
};

export type OwlKitConnectEvent = OwlKitAccount & {
  isReconnected: boolean;
};

export type OwlKitAccountChangeEvent = {
  address: Address;
  previous?: Address;
};

export type OwlKitChainChangeEvent = {
  chainId: number;
  previous?: number;
  chain?: Chain;
};

export type OwlKitHandlers = {
  onConnecting?: () => void;
  onConnect?: (event: OwlKitConnectEvent) => void;
  onReconnect?: (event: OwlKitConnectEvent) => void;
  onDisconnect?: () => void;
  onAccountChange?: (event: OwlKitAccountChangeEvent) => void;
  onChainChange?: (event: OwlKitChainChangeEvent) => void;
  onError?: (error: Error) => void;
};
