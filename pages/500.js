export default function Custom500() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "#e2e8f0",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>500</h1>
        <p style={{ marginTop: "12px", opacity: 0.9 }}>
          Something went wrong on the server.
        </p>
      </div>
    </main>
  );
}

