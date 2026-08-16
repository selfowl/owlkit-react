"use client";

/** Connect CTA only. Account chrome belongs in the host app. */
import { useOwlKit } from "./context";

function Spinner() {
  return <span className="owlkit-spinner" aria-hidden="true" />;
}

export function ConnectButton() {
  const { kit, connection, isPending, labels, reset } = useOwlKit();

  if (connection.isConnected) return null;

  return (
    <div className="owlkit-root">
      <button
        className="owlkit-button"
        type="button"
        onClick={() => {
          reset();
          kit.open();
        }}
      >
        {isPending ? <Spinner /> : null}
        {isPending ? labels.connecting : labels.connect}
      </button>
    </div>
  );
}
