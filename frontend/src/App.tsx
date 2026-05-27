function App() {
  return (
    <div
      style={{
        backgroundColor: "#111827",
        minHeight: "100vh",
        color: "white",
        padding: "2rem",
        fontFamily: "Arial"
      }}
    >
      <h1>TrackOps</h1>

      <p>
        Real-Time Motorsport Operations Dashboard
      </p>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#1f2937",
          borderRadius: "8px"
        }}
      >
        <h2>Backend Status</h2>

        <p>
          FastAPI telemetry backend connected.
        </p>
      </div>
    </div>
  )
}

export default App