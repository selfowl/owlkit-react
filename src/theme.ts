/** Default theme, labels, CSS vars, and merge helpers. */
import type { CSSProperties } from "react";
import type { OwlKitRadius, OwlKitTheme } from "./types";

export const defaultTheme: OwlKitTheme = {
  accent: "#18181b",
  background: "#ffffff",
  text: "#09090b",
  muted: "#71717a",
  border: "#e4e4e7",
  button: "#18181b",
  buttonText: "#fafafa",
  modal: "#ffffff",
  wallet: "#ffffff",
  overlay: "#09090b",
  overlayBlur: 8,
  error: "#dc2626",
  font: "inherit",
  fontSize: 14,
  modalWidth: 360,
  radius: {
    button: 8,
    modal: 12,
    wallet: 8,
  },
};

export const defaultLabels = {
  connect: "Connect Wallet",
  connecting: "Connecting",
  modalTitle: "Connect a wallet",
  accountTitle: "Account",
  copyAddress: "Copy address",
  copied: "Copied",
  disconnect: "Disconnect",
  viewExplorer: "View on explorer",
};

export const defaultCssVars = {
  "--owlkit-overlay-padding": "1.25rem",
  "--owlkit-modal-padding": "1rem",
  "--owlkit-modal-shadow":
    "0 1px 2px rgb(0 0 0 / 0.04), 0 16px 40px rgb(0 0 0 / 0.12)",
  "--owlkit-header-gap": "0.75rem",
  "--owlkit-header-margin": "0.85rem",
  "--owlkit-list-gap": "0.4rem",
  "--owlkit-logo-size": "1.35rem",
  "--owlkit-icon-size": "1.5rem",
  "--owlkit-close-size": "1.75rem",
  "--owlkit-mark-size": "3rem",
  "--owlkit-dot-size": "0.4rem",
  "--owlkit-spinner-size": "0.85rem",
  "--owlkit-title-size": "15px",
  "--owlkit-hint-size": "0.75rem",
  "--owlkit-error-size": "0.8rem",
  "--owlkit-address-size": "1.125rem",
  "--owlkit-font-weight": "500",
  "--owlkit-button-height": "2.25rem",
  "--owlkit-button-padding": "0.875rem",
  "--owlkit-button-gap": "0.5rem",
  "--owlkit-wallet-height": "2.75rem",
  "--owlkit-wallet-padding": "0.55rem 0.7rem",
  "--owlkit-wallet-gap": "0.65rem",
  "--owlkit-account-gap": "1rem",
  "--owlkit-action-gap": "0.4rem",
  "--owlkit-radius-close": "6px",
  "--owlkit-radius-icon": "6px",
  "--owlkit-radius-action": "8px",
  "--owlkit-dot": "#22c55e",
} as const;

export type OwlKitCssVar = keyof typeof defaultCssVars;

function radiusValue(value: OwlKitRadius | undefined, fallback: string) {
  if (value === undefined) return fallback;
  if (value === "pill") return "999px";
  return `${value}px`;
}

export function resolveRadius(theme: OwlKitTheme) {
  if (typeof theme.radius === "number" || theme.radius === "pill") {
    const value = radiusValue(theme.radius, "8px");
    return {
      button: theme.radius === "pill" ? "999px" : value,
      modal: value,
      wallet: value,
    };
  }

  return {
    button: radiusValue(theme.radius.button, "8px"),
    modal: radiusValue(theme.radius.modal, "12px"),
    wallet: radiusValue(theme.radius.wallet, "8px"),
  };
}

export function mergeRadius(
  current: OwlKitTheme["radius"],
  next?: OwlKitTheme["radius"],
): OwlKitTheme["radius"] {
  if (next === undefined) return current;
  if (typeof next === "number" || next === "pill") return next;
  if (typeof current === "number" || current === "pill") {
    return { button: current, modal: current, wallet: current, ...next };
  }
  return { ...current, ...next };
}

export function mergeTheme(
  current: OwlKitTheme,
  next: Partial<OwlKitTheme> = {},
): OwlKitTheme {
  const { vars: nextVars, radius: nextRadius, ...rest } = next;
  return {
    ...current,
    ...rest,
    radius: mergeRadius(current.radius, nextRadius),
    vars: nextVars ? { ...current.vars, ...nextVars } : current.vars,
  };
}

function parseRgb(color: string) {
  const value = color.trim();
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length === 3) {
      return {
        r: Number.parseInt(hex[0] + hex[0], 16),
        g: Number.parseInt(hex[1] + hex[1], 16),
        b: Number.parseInt(hex[2] + hex[2], 16),
      };
    }
    if (hex.length === 6) {
      return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
      };
    }
  }

  const match = value.match(
    /rgba?\(\s*([\d.]+)[,\s/]+([\d.]+)[,\s/]+([\d.]+)/i,
  );
  if (!match) return null;
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
}

function overlayFill(color: string) {
  const rgb = parseRgb(color);
  if (!rgb) return color;
  return `rgb(${rgb.r} ${rgb.g} ${rgb.b} / 0.4)`;
}

export function themeToStyle(theme: OwlKitTheme): CSSProperties {
  const radius = resolveRadius(theme);

  return {
    ...defaultCssVars,
    "--owlkit-accent": theme.accent,
    "--owlkit-background": theme.background,
    "--owlkit-text": theme.text,
    "--owlkit-muted": theme.muted,
    "--owlkit-border": theme.border,
    "--owlkit-button": theme.button,
    "--owlkit-button-text": theme.buttonText,
    "--owlkit-modal": theme.modal,
    "--owlkit-wallet": theme.wallet,
    "--owlkit-overlay": overlayFill(theme.overlay),
    "--owlkit-overlay-blur": `${theme.overlayBlur ?? 8}px`,
    "--owlkit-error": theme.error,
    "--owlkit-font": theme.font ?? "inherit",
    "--owlkit-font-size": `${theme.fontSize ?? 14}px`,
    "--owlkit-modal-width": `${theme.modalWidth ?? 360}px`,
    "--owlkit-radius-button": radius.button,
    "--owlkit-radius-modal": radius.modal,
    "--owlkit-radius-wallet": radius.wallet,
    ...theme.vars,
  } as CSSProperties;
}
