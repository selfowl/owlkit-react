"use client";

/** Theme CSS vars, kit context, and the `useOwlKit()` hook. */
import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  useConnect,
  useConnection,
  useConnectors,
  useDisconnect,
  type Connector,
} from "wagmi";
import type { OwlKit } from "./kit";
import { themeToStyle } from "./theme";

const OwlKitContext = createContext<OwlKit | null>(null);

export function OwlKitThemeRoot({
  kit,
  children,
}: {
  kit: OwlKit;
  children: ReactNode;
}) {
  const snapshot = useSyncExternalStore(
    kit.subscribe.bind(kit),
    () => kit.snapshot,
    () => kit.snapshot,
  );

  return (
    <div className="owlkit-vars" style={themeToStyle(snapshot.theme)}>
      {children}
    </div>
  );
}

export function OwlKitContextProvider({
  kit,
  children,
}: {
  kit: OwlKit;
  children: ReactNode;
}) {
  return (
    <OwlKitContext.Provider value={kit}>{children}</OwlKitContext.Provider>
  );
}

export function useOwlKit() {
  const kit = useContext(OwlKitContext);
  if (!kit) {
    throw new Error("useOwlKit() must be used inside OwlKitProvider.");
  }

  const snapshot = useSyncExternalStore(
    kit.subscribe.bind(kit),
    () => kit.snapshot,
    () => kit.snapshot,
  );
  const isOpen = useSyncExternalStore(
    kit.subscribeModal.bind(kit),
    () => kit.isOpen,
    () => false,
  );
  const connectors = useConnectors();
  const connection = useConnection();
  const { mutate: connect, isPending, error, reset, variables } = useConnect();
  const { mutate: disconnect } = useDisconnect();

  const wallets = useMemo(
    () => kit.list(connectors),
    [kit, snapshot, connectors],
  );

  return {
    kit,
    theme: snapshot.theme,
    labels: snapshot.labels,
    logo: snapshot.logo,
    inlineErrors: snapshot.inlineErrors,
    wallets,
    providers: () => kit.providers(connectors),
    provider: (id: string) => kit.provider(id, connectors),
    wallet: (id: string) => kit.wallet(id, connectors),
    connect: (target: string | Connector) => {
      const connector =
        typeof target === "string"
          ? kit.wallet(target, connectors)
          : target;
      if (!connector) {
        throw new Error(`OwlKit: wallet "${String(target)}" is not available.`);
      }
      kit.emit("onConnecting");
      connect(
        { connector },
        {
          onError(nextError) {
            kit.reportError(nextError);
          },
        },
      );
    },
    disconnect: () => {
      disconnect(
        {},
        {
          onError(nextError) {
            kit.reportError(nextError);
          },
        },
      );
    },
    isOpen,
    open: kit.open.bind(kit),
    close: kit.close.bind(kit),
    connection,
    isPending,
    pendingId:
      variables?.connector && "uid" in variables.connector
        ? variables.connector.uid
        : undefined,
    error,
    reset,
    getBalance: kit.getBalance.bind(kit),
    getToken: kit.getToken.bind(kit),
    readContract: kit.readContract.bind(kit),
    writeContract: kit.writeContract.bind(kit),
  };
}
