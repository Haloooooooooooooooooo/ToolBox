interface AddSiteDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddSiteDialog({ open, onClose }: AddSiteDialogProps) {
  if (!open) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <header className="dialog-header">
          <h1>添加网站</h1>
          <button className="close" onClick={onClose} type="button">
            ×
          </button>
        </header>

        <div className="body">
          <div className="field">
            <div className="field-row">
              <label className="label">网站名称</label>
            </div>
            <input className="input" readOnly type="text" value="ChatGPT" />
          </div>

          <div className="field">
            <div className="field-row">
              <label className="label">网站链接（自动获取）</label>
              <span className="hint">Auto-Sync Active</span>
            </div>
            <div className="url-box">
              <span className="url-icon">⌁</span>
              <span>https://chat.openai.com</span>
            </div>
          </div>

          <div className="field">
            <div className="field-row">
              <label className="label">分类</label>
            </div>
            <div className="category-grid">
              <button className="category active" type="button">
                <span className="box">■</span>
                开发常用
              </button>
              <button className="category" type="button">
                <span className="box"></span>
                UI设计
              </button>
              <button className="category" type="button">
                <span className="box"></span>
                笔记
              </button>
              <button className="category" type="button">
                <span className="box"></span>
                其他
              </button>
            </div>
          </div>

          <div className="field">
            <div className="field-row">
              <label className="label">备注（可选）</label>
            </div>
            <textarea className="textarea" readOnly value="日常 AI 工具" />
          </div>
        </div>

        <footer className="footer-dialog">
          <div className="decor">
            <span className="red"></span>
            <span className="blue"></span>
            <span className="gold"></span>
          </div>
          <div className="actions">
            <button className="btn" onClick={onClose} type="button">
              取消
            </button>
            <button className="btn primary" type="button">
              保存
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
