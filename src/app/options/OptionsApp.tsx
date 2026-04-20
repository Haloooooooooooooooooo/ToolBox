export function OptionsApp() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px",
        background: "var(--bg)"
      }}
    >
      <section
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          background: "var(--panel)",
          border: "2px solid var(--line)",
          padding: "24px"
        }}
      >
        <h1 style={{ marginTop: 0 }}>PinBase 设置页</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          当前先保留一个最小可用 Options 入口。后续可以在这里扩展快捷键说明、
          导入导出、调试信息和分类管理。
        </p>
      </section>
    </main>
  );
}
