/** Balance, token metadata, and contract calls on a wagmi config. */
import type { Abi, Address } from "viem";
import { erc20Abi, formatUnits } from "viem";
import type { Config } from "wagmi";
import {
  getBalance as wagmiGetBalance,
  getConnection,
  readContract as wagmiReadContract,
  writeContract as wagmiWriteContract,
} from "wagmi/actions";

export type OwlKitBalanceRequest = {
  address?: Address;
  token?: Address;
  chainId?: number;
};

export type OwlKitBalance = {
  value: bigint;
  decimals: number;
  symbol: string;
  formatted: string;
  token?: Address;
};

export type OwlKitToken = {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
};

export type OwlKitContractCall = {
  address: Address;
  abi: Abi | readonly unknown[];
  functionName: string;
  args?: readonly unknown[];
  chainId?: number;
  value?: bigint;
};

function connectedAddress(config: Config) {
  return getConnection(config).address;
}

export async function getOwlBalance(
  config: Config,
  parameters: OwlKitBalanceRequest = {},
): Promise<OwlKitBalance> {
  const address = parameters.address ?? connectedAddress(config);
  if (!address) {
    throw new Error("OwlKit: pass address or connect a wallet first.");
  }

  if (!parameters.token) {
    const result = await wagmiGetBalance(config, {
      address,
      chainId: parameters.chainId,
    });
    return {
      value: result.value,
      decimals: result.decimals,
      symbol: result.symbol,
      formatted: formatUnits(result.value, result.decimals),
    };
  }

  const token = parameters.token;
  const [value, decimals, symbol] = await Promise.all([
    wagmiReadContract(config, {
      address: token,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
      chainId: parameters.chainId,
    }),
    wagmiReadContract(config, {
      address: token,
      abi: erc20Abi,
      functionName: "decimals",
      chainId: parameters.chainId,
    }),
    wagmiReadContract(config, {
      address: token,
      abi: erc20Abi,
      functionName: "symbol",
      chainId: parameters.chainId,
    }),
  ]);

  return {
    value,
    decimals,
    symbol,
    formatted: formatUnits(value, decimals),
    token,
  };
}

export async function getOwlToken(
  config: Config,
  parameters: { token: Address; chainId?: number },
): Promise<OwlKitToken> {
  const [name, symbol, decimals] = await Promise.all([
    wagmiReadContract(config, {
      address: parameters.token,
      abi: erc20Abi,
      functionName: "name",
      chainId: parameters.chainId,
    }),
    wagmiReadContract(config, {
      address: parameters.token,
      abi: erc20Abi,
      functionName: "symbol",
      chainId: parameters.chainId,
    }),
    wagmiReadContract(config, {
      address: parameters.token,
      abi: erc20Abi,
      functionName: "decimals",
      chainId: parameters.chainId,
    }),
  ]);

  return {
    address: parameters.token,
    name,
    symbol,
    decimals,
  };
}

export function readOwlContract(config: Config, parameters: OwlKitContractCall) {
  // wagmi's generic Abi inference is wider than our public call shape
  return wagmiReadContract(config, parameters as never);
}

export function writeOwlContract(config: Config, parameters: OwlKitContractCall) {
  return wagmiWriteContract(config, parameters as never);
}
