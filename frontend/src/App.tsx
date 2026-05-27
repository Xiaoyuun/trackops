import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type LapAnalysis = {
  total_laps: number;
  fastest_lap: number;
  average_lap: number;
};

type LapSummary = {
  lap_number: number;
  lap_duration: number | null;
  sector_1: number | null;
  sector_2: number | null;
  sector_3: number | null;
  is_pit_out_lap: boolean | null;
};

// allows for driver dropdown
type DriverOption = {
  label: string;
  value: number;
};

function App() {
  const drivers: DriverOption[] = [
    { label: "Oscar Piastri", value: 81 },
    { label: "Lando Norris", value: 1 },
    { label: "Max Verstappen", value: 3 },
    { label: "Charles Leclerc", value: 16 },
  ];

  const [lapAnalysis, setLapAnalysis] = useState<LapAnalysis | null>(null);
  const [strategyAlerts, setStrategyAlerts] = useState<any>(null);
  const [lapSummary, setLapSummary] = useState<LapSummary[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<number>(81);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/lap-analysis?session_key=11291&driver_number=${selectedDriver}`)
      .then((response) => response.json())
      .then((data) => setLapAnalysis(data))
      .catch((error) => console.error("Error fetching lap analysis:", error));
    fetch(`http://127.0.0.1:8000/strategy-alerts?session_key=11291&driver_number=${selectedDriver}`)
      .then((response) => response.json())
      .then((data) => setStrategyAlerts(data))
      .catch((error) => console.error("Error fetching strategy alerts:", error));
    fetch(`http://127.0.0.1:8000/lap-summary?session_key=11291&driver_number=${selectedDriver}`)
      .then((response) => response.json())
      .then((data) => {
        const cleanData = data.filter((lap: LapSummary) => lap.lap_duration !== null);
        setLapSummary(cleanData);
      })
      .catch((error) => console.error("Error fetching lap summary:", error));
  }, [selectedDriver]);

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

      <div style={{ marginTop: "1.5rem" }}>
        <label htmlFor="driver-select">Driver: </label>

        <select
          id="driver-select"
          value={selectedDriver}
          onChange={(event) => setSelectedDriver(Number(event.target.value))}
        >
          {drivers.map((driver) => (
            <option key={driver.value} value={driver.value}>
              {driver.label}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#1f2937",
          borderRadius: "8px",
        }}
      >
        <h2>Information</h2>
        <>
          <p>Driver Number: {selectedDriver}</p>
          <p>Race: Melbourne</p>
        </>

      </div>

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

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#1f2937",
          borderRadius: "8px",
        }}
      >
        <h2>Strategy Alerts</h2>

        {strategyAlerts ? (
          <>
            <p>Average Lap: {strategyAlerts.average_lap}s</p>
            <p>Recent Average: {strategyAlerts.recent_average}s</p>

            {strategyAlerts.alerts.length > 0 ? (
              <ul>
                {strategyAlerts.alerts.map((alert: any, index: number) => (
                  <li key={index}>
                    [{alert.severity.toUpperCase()}] {alert.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No active alerts.</p>
            )}
          </>
        ) : (
          <p>Loading strategy alerts...</p>
        )}
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#1f2937",
          borderRadius: "8px",
        }}
      >
        <h2>Lap Time Trend</h2>

        <div style={{ width: "100%", height: "300px", minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lapSummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lap_number" />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="lap_duration"
                stroke="#38bdf8"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>

  );
}

export default App;