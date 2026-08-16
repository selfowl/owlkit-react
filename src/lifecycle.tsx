"use client";

/** Forwards wagmi connect/disconnect/account/chain into kit handlers. */
import { useEffect, useRef } from "react";
import { useConnection, useConnectionEffect } from "wagmi";
import type { OwlKit } from "./kit";

export function OwlKitLifecycle({ kit }: { kit: OwlKit }) {
  const connection = useConnection();
  const previous = useRef<{ address?: string; chainId?: number }>({});
  const lastStatus = useRef(connection.status);

  useConnectionEffect({
    onConnect(data) {
      const event = {
        address: data.address,
        addresses: data.addresses,
        chainId: data.chainId,
        chain: data.chain,
        connector: data.connector
          ? {
              id: data.connector.id,
              name: data.connector.name,
              uid: data.connector.uid,
            }
          : undefined,
        isReconnected: data.isReconnected,
      };
      kit.emit("onConnect", event);
      if (data.isReconnected) kit.emit("onReconnect", event);
    },
    onDisconnect() {
      previous.current = {};
      kit.emit("onDisconnect");
    },
  });

  useEffect(() => {
    if (
      connection.status === "connecting" &&
      lastStatus.current !== "connecting"
    ) {
      kit.emit("onConnecting");
    }
    lastStatus.current = connection.status;
  }, [connection.status, kit]);

  useEffect(() => {
    const prev = previous.current;

    if (
      connection.address &&
      prev.address &&
      connection.address !== prev.address
    ) {
      kit.emit("onAccountChange", {
        address: connection.address,
        previous: prev.address as `0x${string}`,
      });
    }

    if (
      connection.chainId &&
      prev.chainId &&
      connection.chainId !== prev.chainId
    ) {
      kit.emit("onChainChange", {
        chainId: connection.chainId,
        previous: prev.chainId,
        chain: connection.chain,
      });
    }

    previous.current = {
      address: connection.address,
      chainId: connection.chainId,
    };
  }, [connection.address, connection.chain, connection.chainId, kit]);

  return null;
}
