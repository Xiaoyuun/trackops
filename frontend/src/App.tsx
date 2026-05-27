import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label,
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

type StintAnalysis = {
  stint_number: number;
  compound: string;
  lap_start: number;
  lap_end: number;
  tyre_age_at_start: number;
};


// frontend styling

const cardStyle = {
  padding: "1rem",
  backgroundColor: "#1f2937",
  borderRadius: "12px",
  border: "1px solid #374151",
};

const comparisonColors = ["#f97316", "#a78bfa", "#22c55e", "#f43f5e"];

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
  const [comparisonDrivers, setComparisonDrivers] = useState<number[]>([]);
  const [comparisonLapSummaries, setComparisonLapSummaries] = useState<
    Record<number, LapSummary[]>
  >({});
  const [driverToAdd, setDriverToAdd] = useState<number | null>(null);
  const [stintAnalysis, setStintAnalysis] = useState<StintAnalysis[]>([]);

  const chartData = lapSummary.map((lap) => {
    const row: Record<string, number | null> = {
      lap_number: lap.lap_number,
      selected_lap_duration: lap.lap_duration,
    };

    comparisonDrivers.forEach((driverNumber) => {
      const comparisonLap = comparisonLapSummaries[driverNumber]?.find(
        (otherLap) => otherLap.lap_number === lap.lap_number
      );

      row[`driver_${driverNumber}`] = comparisonLap?.lap_duration ?? null;
    });

    return row;
  });

  useEffect(() => {
    comparisonDrivers.forEach((driverNumber) => {
      if (comparisonLapSummaries[driverNumber]) return;

      fetch(
        `http://127.0.0.1:8000/lap-summary?session_key=${selectedSession}&driver_number=${driverNumber}`
      )
        .then((response) => response.json())
        .then((data) => {
          const cleanData = data.filter(
            (lap: LapSummary) => lap.lap_duration !== null
          );

          setComparisonLapSummaries((current) => ({
            ...current,
            [driverNumber]: cleanData,
          }));
        })
        .catch((error) =>
          console.error("Error fetching comparison lap summary:", error)
        );
    });
  }, [comparisonDrivers, selectedSession, comparisonLapSummaries]);

  // when session changes fetch drivers
  useEffect(() => {
    setDrivers([]);

    fetch(`http://127.0.0.1:8000/drivers?session_key=${selectedSession}`)
      .then((response) => response.json())
      .then((data) => {
        setDrivers(data);

        if (data.length > 0) {
          setSelectedDriver(data[0].driver_number);
          setDriverToAdd(data[1]?.driver_number ?? null);
          setComparisonDrivers([]);
          setComparisonLapSummaries({});
        } else {
          setSelectedDriver(null);
          setDriverToAdd(null);
          setComparisonDrivers([]);
          setComparisonLapSummaries({});
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
    fetch(`http://127.0.0.1:8000/stint-analysis?session_key=${selectedSession}&driver_number=${selectedDriver}`)
      .then((response) => response.json())
      .then((data) => setStintAnalysis(data))
      .catch((error) => console.error("Error fetching stint analysis:", error));
  }, [selectedDriver, selectedSession, drivers]);

  function addComparisonDriver() {
    if (driverToAdd === null) return;
    if (comparisonDrivers.includes(driverToAdd)) return;
    if (driverToAdd === selectedDriver) return;
    if (comparisonDrivers.length >= 4) return;

    setComparisonDrivers([...comparisonDrivers, driverToAdd]);
  }

  function removeComparisonDriver(driverNumber: number) {
    setComparisonDrivers(
      comparisonDrivers.filter((driver) => driver !== driverNumber)
    );

    setComparisonLapSummaries((current) => {
      const updated = { ...current };
      delete updated[driverNumber];
      return updated;
    });
  }

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
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label htmlFor="session-select">Session:</label>
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

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label htmlFor="driver-select">Driver:</label>
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

      </div>



      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <div style={{
          ...cardStyle,
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}>
          <h3 style={{ margin: 0, marginBottom: "1rem" }}>Total Laps</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>{lapAnalysis?.total_laps ?? "—"}</p>
        </div>

        <div style={{
          ...cardStyle,
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}>
          <h3 style={{ margin: 0, marginBottom: "1rem" }}>Fastest Lap</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>
            {lapAnalysis ? `${lapAnalysis.fastest_lap}s` : "—"}
          </p>
        </div>

        <div style={{
          ...cardStyle,
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}>
          <h3 style={{ margin: 0, marginBottom: "1rem" }}>Average Lap</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>
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

      <h3>Comparing Drivers</h3>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {comparisonDrivers.map((driverNumber, index) => {
          const driver = drivers.find((d) => d.driver_number === driverNumber);

          return (
            <div
              key={driverNumber}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: comparisonColors[index],
                  borderRadius: "3px",
                }}
              />
              <span>{driver?.full_name}</span>
              <button onClick={() => removeComparisonDriver(driverNumber)}>×</button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <select
          value={driverToAdd ?? ""}
          onChange={(event) => setDriverToAdd(Number(event.target.value))}
        >
          {drivers
            .filter(
              (driver) =>
                driver.driver_number !== selectedDriver &&
                !comparisonDrivers.includes(driver.driver_number)
            )
            .map((driver) => (
              <option key={driver.driver_number} value={driver.driver_number}>
                {driver.full_name} ({driver.name_acronym})
              </option>
            ))}
        </select>

        <button onClick={addComparisonDriver}>Add Driver</button>
      </div>

      <div style={{ ...cardStyle, marginTop: "2rem" }}>
        <h2>Lap Time Trend</h2>

        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            marginBottom: "1rem",
            marginLeft: "1rem",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "14px",
                height: "14px",
                backgroundColor: "#38bdf8",
                borderRadius: "3px"
              }}
            />
            <span>
              {
                drivers.find(
                  (driver) => driver.driver_number === selectedDriver
                )?.name_acronym
              }
            </span>
          </div>

          {comparisonDrivers.map((driverNumber, index) => {
            const driver = drivers.find((d) => d.driver_number === driverNumber);

            return (
              <div
                key={driverNumber}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    backgroundColor: comparisonColors[index],
                    borderRadius: "3px",
                  }}
                />
                <span>{driver?.name_acronym}</span>
              </div>
            );
          })}
        </div>
        {lapSummary.length > 0 && (
          <ResponsiveContainer width="99%" height={300}>
            <LineChart data={chartData}
              margin={{ top: 20, right: 30, left: 60, bottom: 35 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lap_number">
                <Label
                  value="Lap Number"
                  position="bottom"
                  offset={15}
                  fill="white"
                />
              </XAxis>
              <YAxis domain={["dataMin - 1", "dataMax + 1"]}>
                <Label
                  value="Time (seconds)"
                  angle={-90}
                  position="center"
                  dx={-70}
                  fill="white"
                />
              </YAxis>
              <Tooltip />
              <Line
                type="monotone"
                dataKey="selected_lap_duration"
                stroke="#38bdf8"
                dot={false}
              />
              {comparisonDrivers.map((driverNumber, index) => (
                <Line
                  key={driverNumber}
                  type="monotone"
                  dataKey={`driver_${driverNumber}`}
                  stroke={comparisonColors[index]}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ ...cardStyle, marginTop: "2rem" }}>
        <h2>Sector Time Trend</h2>

        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            marginTop: "1rem",
            marginBottom: "1rem",
            marginLeft: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "14px",
                height: "14px",
                backgroundColor: "#38bdf8",
                borderRadius: "3px",
              }}
            />
            <span>Sector 1</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "14px",
                height: "14px",
                backgroundColor: "#f97316",
                borderRadius: "3px",
              }}
            />
            <span>Sector 2</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "14px",
                height: "14px",
                backgroundColor: "#22c55e",
                borderRadius: "3px",
              }}
            />
            <span>Sector 3</span>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            minWidth: "300px",
            height: "300px",
          }}
        >
          <ResponsiveContainer width="99%" height={300}>
            <LineChart data={lapSummary}
              margin={{ top: 20, right: 30, left: 60, bottom: 35 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lap_number">
                <Label
                  value="Lap Number"
                  position="bottom"
                  offset={15}
                  fill="white"
                />
              </XAxis>
              <YAxis domain={["dataMin - 1", "dataMax + 1"]}>
                <Label
                  value="Time (seconds)"
                  angle={-90}
                  position="center"
                  dx={-70}
                  fill="white"
                />
              </YAxis>
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sector_1"
                stroke="#38bdf8"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="sector_2"
                stroke="#f97316"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="sector_3"
                stroke="#22c55e"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: "2rem" }}>
        <h2>Tire Stint Analysis</h2>

        <div style={{ display: "grid", gap: "1rem" }}>
          {stintAnalysis.map((stint) => (
            <div
              key={stint.stint_number}
              style={{
                padding: "1rem",
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "10px",
              }}
            >
              <h3>Stint {stint.stint_number} — {stint.compound ?? "Unknown"}</h3>
              <p>
                Laps {stint.lap_start}–{stint.lap_end} (
                {stint.lap_end - stint.lap_start + 1} laps)
              </p>
              <p>Tyre Age at Start: {stint.tyre_age_at_start} laps</p>
            </div>
          ))}
        </div>
      </div>

    </div>

  );
}

export default App;