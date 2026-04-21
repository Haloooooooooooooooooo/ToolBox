interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  isConfirming = false,
  onConfirm,
  onClose
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog category-dialog">
        <header className="dialog-header">
          <h1>{title}</h1>
          <button className="close" onClick={onClose} type="button">
            ×
          </button>
        </header>

        <div className="body">
          <p className="confirm-copy">{description}</p>
        </div>

        <footer className="footer-dialog">
          <div className="decor">
            <span className="red"></span>
            <span className="blue"></span>
            <span className="gold"></span>
          </div>
          <div className="actions">
            <button className="btn" disabled={isConfirming} onClick={onClose} type="button">
              {cancelLabel}
            </button>
            <button className="btn primary" disabled={isConfirming} onClick={onConfirm} type="button">
              {isConfirming ? "处理中..." : confirmLabel}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
