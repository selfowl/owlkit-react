/** User-rejection detection and error normalization. */

type ErrorLike = {
  code?: unknown;
  name?: string;
  message?: string;
};

export function isUserRejection(error: unknown) {
  if (!error) return false;

  const message = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name : "";
  const code =
    typeof error === "object" && error && "code" in error
      ? (error as ErrorLike).code
      : undefined;

  return (
    code === 4001 ||
    name === "UserRejectedRequestError" ||
    /user rejected/i.test(message)
  );
}

export function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}
