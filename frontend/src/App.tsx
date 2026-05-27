import { useEffect, useState } from "react";

type LapAnalysis = {
  total_laps: number;
  fastest_lap: number;
  average_lap: number;
};

function App() {
  const [lapAnalysis, setLapAnalysis] = useState<LapAnalysis | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/lap-analysis?session_key=9488&driver_number=81")
      .then((response) => response.json())
      .then((data) => setLapAnalysis(data))
      .catch((error) => console.error("Error fetching lap analysis:", error));
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#111827",
        minHeight: "100vh",
        color: "white",
        padding: "2rem",
        fontFamily: "Arial",
      }}
    >
      <h1>TrackOps</h1>
      <p>Real-Time Motorsport Operations Dashboard</p>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#1f2937",
          borderRadius: "8px",
        }}
      >
        <h2>Lap Analysis</h2>

        {lapAnalysis ? (
          <>
            <p>Total Laps: {lapAnalysis.total_laps}</p>
            <p>Fastest Lap: {lapAnalysis.fastest_lap}s</p>
            <p>Average Lap: {lapAnalysis.average_lap}s</p>
          </>
        ) : (
          <p>Loading lap analysis...</p>
        )}
      </div>
    </div>
  );
}

export default App;