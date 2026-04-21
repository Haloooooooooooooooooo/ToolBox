import type { FormEvent } from "react";
import { useEffect, useState } from "react";

interface AddCategoryDialogProps {
  open: boolean;
  isSaving: boolean;
  errorMessage: string;
  title?: string;
  submitLabel?: string;
  initialName?: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function AddCategoryDialog({
  open,
  isSaving,
  errorMessage,
  title = "新增分类",
  submitLabel = "新增分类",
  initialName = "",
  onClose,
  onSave
}: AddCategoryDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(initialName);
  }, [initialName, open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || isSaving) return;
    onSave(name);
  }

  if (!open) return null;

  return (
    <div className="dialog-backdrop">
      <form className="dialog category-dialog" onSubmit={handleSubmit}>
        <header className="dialog-header">
          <h1>{title}</h1>
          <button className="close" onClick={onClose} type="button">
            ×
          </button>
        </header>

        <div className="body">
          <div className="field">
            <div className="field-row">
              <label className="label" htmlFor="new-category-name">
                分类名称
              </label>
            </div>
            <input
              autoFocus
              className="input"
              id="new-category-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="例如：AI 工具"
              type="text"
              value={name}
            />
          </div>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        </div>

        <footer className="footer-dialog">
          <div className="decor">
            <span className="red"></span>
            <span className="blue"></span>
            <span className="gold"></span>
          </div>
          <div className="actions">
            <button className="btn" disabled={isSaving} onClick={onClose} type="button">
              取消
            </button>
            <button className="btn primary" disabled={!name.trim() || isSaving} type="submit">
              {isSaving ? "保存中..." : submitLabel}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
