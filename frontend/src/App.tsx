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
  full_name: string;
  driver_number: number;
  name_acronym: string;
};

type SessionOption = {
  label: string;
  value: number;
};

function App() {
  const [drivers, setDrivers] = useState<DriverOption[]>([]);

  const sessions: SessionOption[] = [
    { label: "2024 Abu Dhabi GP - Race", value: 9488 },
    { label: "2024 Monza GP - Race", value: 9636 },
    { label: "2024 Monaco GP - Race", value: 9533 },
    { label: "2026 Canadian GP - Race", value: 11291 }
  ];

  const [lapAnalysis, setLapAnalysis] = useState<LapAnalysis | null>(null);
  const [strategyAlerts, setStrategyAlerts] = useState<any>(null);
  const [lapSummary, setLapSummary] = useState<LapSummary[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(81);
  const [selectedSession, setSelectedSession] = useState<number>(11291);

  // when session changes fetch drivers
  useEffect(() => {
    setDrivers([]);

    fetch(`http://127.0.0.1:8000/drivers?session_key=${selectedSession}`)
      .then((response) => response.json())
      .then((data) => {
        setDrivers(data);

        if (data.length > 0) {
          setSelectedDriver(data[0].driver_number);
        } else {
          setSelectedDriver(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching drivers:", error);
        setDrivers([]);
        setSelectedDriver(null);
      });
  }, [selectedSession]);

  // lap data fetchiing use effect
  useEffect(() => {
    // avoid fetchiing lap data before driver exists
    if (selectedDriver === null) return;

    // when fetching new lap data, clear old chart data first
    // setLapSummary([]);

    const driverExistsInSession = drivers.some(
      (driver) => driver.driver_number === selectedDriver
    );

    if (!driverExistsInSession) return;

    // fetch lap analysis, strategy alerts, lap summary below
    fetch(`http://127.0.0.1:8000/lap-analysis?session_key=${selectedSession}&driver_number=${selectedDriver}`)
      .then((response) => response.json())
      .then((data) => setLapAnalysis(data))
      .catch((error) => console.error("Error fetching lap analysis:", error));
    fetch(`http://127.0.0.1:8000/strategy-alerts?session_key=${selectedSession}&driver_number=${selectedDriver}`)
      .then((response) => response.json())
      .then((data) => setStrategyAlerts(data))
      .catch((error) => console.error("Error fetching strategy alerts:", error));
    fetch(`http://127.0.0.1:8000/lap-summary?session_key=${selectedSession}&driver_number=${selectedDriver}`)
      .then((response) => response.json())
      .then((data) => {
        const cleanData = data.filter((lap: LapSummary) => lap.lap_duration !== null);
        setLapSummary(cleanData);
      })
      .catch((error) => console.error("Error fetching lap summary:", error));
  }, [selectedDriver, selectedSession, drivers]);

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
        <label htmlFor="session-select">Session: </label>

        <select
          id="session-select"
          value={selectedSession}
          onChange={(event) => setSelectedSession(Number(event.target.value))}
        >
          {sessions.map((session) => (
            <option key={session.value} value={session.value}>
              {session.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <label htmlFor="driver-select">Driver: </label>

        <select
          id="driver-select"
          value={selectedDriver ?? ""}
          onChange={(event) => setSelectedDriver(Number(event.target.value))}
          disabled={drivers.length === 0}
        >
          {drivers.length === 0 ? (
            <option value="">Loading drivers...</option>
          ) : (
            drivers.map((driver) => (
              <option key={driver.driver_number} value={driver.driver_number}>
                {driver.full_name} ({driver.name_acronym})
              </option>
            ))
          )}
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
          width: "100%",
          minWidth: "300px",
          height: "300px",
        }}
      >
        {lapSummary.length > 0 && (
          <ResponsiveContainer width="99%" height={300}>
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
        )}
      </div>

    </div>

  );
}

export default App;