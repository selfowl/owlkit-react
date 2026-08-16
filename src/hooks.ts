"use client";

/** React Query wrappers for balance and ERC-20 metadata. */
import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { useOwlKit } from "./context";

export function useOwlBalance(parameters: {
  address?: Address;
  token?: Address;
  chainId?: number;
} = {}) {
  const { kit, connection } = useOwlKit();
  const address = parameters.address ?? connection.address;

  return useQuery({
    queryKey: [
      "owlkit",
      "balance",
      address,
      parameters.token,
      parameters.chainId,
    ],
    queryFn: () =>
      kit.getBalance({
        address,
        token: parameters.token,
        chainId: parameters.chainId,
      }),
    enabled: Boolean(address),
  });
}

export function useOwlToken(token?: Address, chainId?: number) {
  const { kit } = useOwlKit();

  return useQuery({
    queryKey: ["owlkit", "token", token, chainId],
    queryFn: () => {
      if (!token) throw new Error("OwlKit: token is required.");
      return kit.getToken(token, chainId);
    },
    enabled: Boolean(token),
  });
}
