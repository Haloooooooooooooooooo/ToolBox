const TOAST_KEY = "pinbase_toast";

export type ToastVariant = "success" | "info" | "error";

export interface ExtensionToastPayload {
  message: string;
  variant: ToastVariant;
  createdAt: number;
}

export async function publishToast(
  message: string,
  variant: ToastVariant = "info"
): Promise<void> {
  await chrome.storage.local.set({
    [TOAST_KEY]: {
      message,
      variant,
      createdAt: Date.now()
    } satisfies ExtensionToastPayload
  });
}

export async function consumeToast(): Promise<ExtensionToastPayload | null> {
  const result = await chrome.storage.local.get(TOAST_KEY);
  const payload = result[TOAST_KEY] as ExtensionToastPayload | undefined;

  if (!payload?.message) {
    return null;
  }

  await chrome.storage.local.remove(TOAST_KEY);
  return {
    message: payload.message,
    variant: payload.variant ?? "info",
    createdAt: payload.createdAt
  };
}

export function getToastStorageKey() {
  return TOAST_KEY;
}
