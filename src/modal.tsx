"use client";

/** Shipped connect + account modal. Opened via `kit.open()`. */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { truncateAddress } from "./address";
import { useOwlKit } from "./context";
import { themeToStyle } from "./theme";

function walletHint(id: string) {
  if (id === "walletConnect") return "QR / mobile";
  if (id === "injected") return "Browser";
  return "Installed";
}

function Spinner() {
  return <span className="owlkit-spinner" aria-hidden="true" />;
}

function addressColor(address: string) {
  return `#${address.slice(2, 8)}`;
}

export function OwlKitModal() {
  const {
    kit,
    connection,
    wallets,
    connect,
    disconnect,
    isPending,
    pendingId,
    error,
    reset,
    labels,
    logo,
    theme,
    inlineErrors,
    isOpen,
  } = useOwlKit();
  const { address, isConnected, chain, connector } = connection;
  const [leaving, setLeaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const session = useRef<"connect" | "account" | null>(null);
  const explorer = chain?.blockExplorers?.default?.url;

  if (isOpen && session.current === null) {
    session.current = isConnected ? "account" : "connect";
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen && !leaving) session.current = null;
  }, [isOpen, leaving]);

  useEffect(() => {
    if (!isOpen || leaving) return;
    if (session.current === "connect" && isConnected) closeModal();
  }, [isConnected, isOpen, leaving]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  function closeModal() {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => {
      kit.close();
      setLeaving(false);
      session.current = null;
    }, 180);
  }

  if (!mounted || (!isOpen && !leaving)) return null;

  const account = session.current === "account" && Boolean(address);

  return createPortal(
    <div
      className={`owlkit-overlay${leaving ? " owlkit-leaving" : ""}`}
      style={themeToStyle(theme)}
      onClick={closeModal}
      role="presentation"
    >
      <div
        className="owlkit-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="owlkit-modal-title"
      >
        <div className="owlkit-header">
          <div className="owlkit-heading">
            {logo ? <img className="owlkit-logo" src={logo} alt="" /> : null}
            <h2 className="owlkit-title" id="owlkit-modal-title">
              {account ? labels.accountTitle : labels.modalTitle}
            </h2>
          </div>
          <button
            className="owlkit-close"
            type="button"
            onClick={closeModal}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {account && address ? (
          <div className="owlkit-account">
            <span
              className="owlkit-mark"
              style={{ background: addressColor(address) }}
              aria-hidden
            />
            <div>
              <p className="owlkit-address">{truncateAddress(address)}</p>
              <p className="owlkit-address-full">{address}</p>
              <p className="owlkit-account-meta">
                {[connector?.name, chain?.name].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="owlkit-actions">
              <button
                className="owlkit-action"
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(address);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                }}
              >
                {copied ? labels.copied : labels.copyAddress}
              </button>
              {explorer ? (
                <a
                  className="owlkit-action"
                  href={`${explorer}/address/${address}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {labels.viewExplorer}
                </a>
              ) : null}
              <button
                className="owlkit-action"
                type="button"
                onClick={() => {
                  disconnect();
                  closeModal();
                }}
              >
                {labels.disconnect}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="owlkit-list">
              {wallets.map((item) => {
                const active = isPending && pendingId === item.uid;
                return (
                  <button
                    key={item.uid}
                    className={`owlkit-wallet${active ? " owlkit-active" : ""}`}
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      reset();
                      connect(item);
                    }}
                  >
                    <span className="owlkit-wallet-meta">
                      {"icon" in item && item.icon ? (
                        <img
                          className="owlkit-wallet-icon"
                          src={String(item.icon)}
                          alt=""
                        />
                      ) : (
                        <span className="owlkit-wallet-fallback">
                          {item.name.slice(0, 1)}
                        </span>
                      )}
                      <span className="owlkit-wallet-name">{item.name}</span>
                    </span>
                    <span className="owlkit-wallet-hint">
                      {active ? <Spinner /> : null}
                      {active ? labels.connecting : walletHint(item.id)}
                    </span>
                  </button>
                );
              })}
            </div>
            {inlineErrors && error ? (
              <p className="owlkit-error">{error.message}</p>
            ) : null}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
