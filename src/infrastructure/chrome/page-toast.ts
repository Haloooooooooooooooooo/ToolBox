import type { ToastVariant } from "./toast";

const variantStyles: Record<
  ToastVariant,
  { borderLeft: string; background: string; color: string }
> = {
  success: {
    borderLeft: "10px solid #1d7a46",
    background: "#e9f8ee",
    color: "#183a25"
  },
  info: {
    borderLeft: "10px solid #b21d31",
    background: "#fff0d4",
    color: "#3f2a1f"
  },
  error: {
    borderLeft: "10px solid #b21d31",
    background: "#ffe1df",
    color: "#5d1818"
  }
};

export async function showPageToast(
  tabId: number,
  message: string,
  variant: ToastVariant = "info"
): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (text: string, styleVariant: ToastVariant) => {
      const existing = document.getElementById("__pinbase-page-toast__");
      existing?.remove();

      const palette = {
        success: {
          borderLeft: "10px solid #1d7a46",
          background: "#e9f8ee",
          color: "#183a25"
        },
        info: {
          borderLeft: "10px solid #b21d31",
          background: "#fff0d4",
          color: "#3f2a1f"
        },
        error: {
          borderLeft: "10px solid #b21d31",
          background: "#ffe1df",
          color: "#5d1818"
        }
      } as const;

      const activeStyle = palette[styleVariant] ?? palette.info;

      const toast = document.createElement("div");
      toast.id = "__pinbase-page-toast__";
      toast.textContent = text;

      const isSuccess = styleVariant === "success";

      Object.assign(toast.style, {
        position: "fixed",
        left: isSuccess ? "50%" : "",
        top: isSuccess ? "20px" : "",
        right: isSuccess ? "" : "20px",
        bottom: isSuccess ? "" : "20px",
        zIndex: "2147483647",
        maxWidth: "320px",
        padding: "14px 16px",
        border: "2px solid #1d1c17",
        borderLeft: activeStyle.borderLeft,
        background: activeStyle.background,
        color: activeStyle.color,
        fontSize: "14px",
        fontWeight: "700",
        lineHeight: "1.5",
        boxShadow: "6px 6px 0 0 rgba(29, 28, 23, 0.28)",
        borderRadius: "10px",
        fontFamily: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
        opacity: "0",
        transform: isSuccess ? "translate(-50%, -8px)" : "translateY(8px)",
        transition: "opacity 160ms ease, transform 160ms ease"
      } satisfies Partial<CSSStyleDeclaration>);

      document.documentElement.appendChild(toast);

      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = isSuccess ? "translate(-50%, 0)" : "translateY(0)";
      });

      window.setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = isSuccess ? "translate(-50%, -8px)" : "translateY(8px)";
        window.setTimeout(() => toast.remove(), 180);
      }, 2600);
    },
    args: [message, variant]
  });
}
