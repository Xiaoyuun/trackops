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

// frontend styling

const cardStyle = {
  padding: "1rem",
  backgroundColor: "#1f2937",
  borderRadius: "12px",
  border: "1px solid #374151",
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

      <div
        style={{
          ...cardStyle,
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginTop: "1.5rem",
        }}
      >
        {<select
          id="session-select"
          value={selectedSession}
          onChange={(event) => setSelectedSession(Number(event.target.value))}
        >
          {sessions.map((session) => (
            <option key={session.value} value={session.value}>
              {session.label}
            </option>
          ))}
        </select>}
        {<select
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
        </select>}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <div style={cardStyle}>
          <h3>Total Laps</h3>
          <p style={{ fontSize: "2rem" }}>{lapAnalysis?.total_laps ?? "—"}</p>
        </div>

        <div style={cardStyle}>
          <h3>Fastest Lap</h3>
          <p style={{ fontSize: "2rem" }}>
            {lapAnalysis ? `${lapAnalysis.fastest_lap}s` : "—"}
          </p>
        </div>

        <div style={cardStyle}>
          <h3>Average Lap</h3>
          <p style={{ fontSize: "2rem" }}>
            {lapAnalysis ? `${lapAnalysis.average_lap}s` : "—"}
          </p>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: "2rem" }}>
        <h2>Strategy Alerts</h2>

        {strategyAlerts?.alerts?.length > 0 ? (
          strategyAlerts.alerts.map((alert: any, index: number) => (
            <div
              key={index}
              style={{
                marginTop: "0.75rem",
                padding: "0.75rem",
                borderRadius: "8px",
                backgroundColor: "#111827",
                border: "1px solid #374151",
              }}
            >
              <strong>[{alert.severity.toUpperCase()}]</strong> {alert.message}
            </div>
          ))
        ) : (
          <p>No active alerts.</p>
        )}
      </div>

      <div style={{ ...cardStyle, marginTop: "2rem" }}>
        <h2>Lap Time Trend</h2>
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