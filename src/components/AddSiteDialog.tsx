import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

interface AddSiteDialogProps {
  open: boolean;
  title: string;
  submitLabel: string;
  initialTitle: string;
  initialUrl: string;
  initialNote: string;
  initialCategory: string;
  categories: string[];
  isSaving: boolean;
  errorMessage: string;
  onClose: () => void;
  onSave: (input: { title: string; url: string; note: string; category: string }) => void;
}

const FALLBACK_CATEGORY = "其他";

export function AddSiteDialog({
  open,
  title,
  submitLabel,
  initialTitle,
  initialUrl,
  initialNote,
  initialCategory,
  categories,
  isSaving,
  errorMessage,
  onClose,
  onSave
}: AddSiteDialogProps) {
  const [siteTitle, setSiteTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState(FALLBACK_CATEGORY);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;

    setSiteTitle(initialTitle);
    setUrl(initialUrl);
    setNote(initialNote);
    setCategory(initialCategory || FALLBACK_CATEGORY);

    const frame = window.requestAnimationFrame(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [initialCategory, initialNote, initialTitle, initialUrl, open]);

  function submitCurrentForm() {
    if (isSaving) return;
    onSave({ title: siteTitle, url, note, category });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitCurrentForm();
  }

  function handleFormKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter" || isSaving || event.nativeEvent.isComposing) return;

    const target = event.target;
    if (target instanceof HTMLTextAreaElement) {
      return;
    }

    event.preventDefault();
    submitCurrentForm();
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      submitCurrentForm();
    }
  }

  if (!open) return null;

  return (
    <div className="dialog-backdrop">
      <form className="dialog" onKeyDown={handleFormKeyDown} onSubmit={handleSubmit}>
        <header className="dialog-header">
          <h1>{title}</h1>
          <button className="close" onClick={onClose} type="button">
            ×
          </button>
        </header>

        <div className="body">
          <div className="field">
            <div className="field-row">
              <label className="label" htmlFor="site-title">
                网站名称
              </label>
            </div>
            <input
              ref={titleInputRef}
              className="input"
              id="site-title"
              onChange={(event) => setSiteTitle(event.target.value)}
              type="text"
              value={siteTitle}
            />
          </div>

          <div className="field">
            <div className="field-row">
              <label className="label" htmlFor="site-url">
                网站链接
              </label>
              <span className="hint">Editable</span>
            </div>
            <input
              className="input"
              id="site-url"
              onChange={(event) => setUrl(event.target.value)}
              type="text"
              value={url}
            />
          </div>

          <div className="field">
            <div className="field-row">
              <label className="label">分类</label>
            </div>
            <div className="category-grid">
              {categories.map((item) => {
                const active = item === category;

                return (
                  <button
                    className={`category ${active ? "active" : ""}`}
                    key={item}
                    onClick={() => setCategory(item)}
                    type="button"
                  >
                    <span className="box">{active ? "■" : ""}</span>
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="field">
            <div className="field-row">
              <label className="label" htmlFor="site-note">
                备注（可选）
              </label>
            </div>
            <textarea
              className="textarea"
              id="site-note"
              onChange={(event) => setNote(event.target.value)}
              onKeyDown={handleTextareaKeyDown}
              value={note}
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
            <button className="btn primary" disabled={isSaving} type="submit">
              {isSaving ? "保存中..." : submitLabel}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
