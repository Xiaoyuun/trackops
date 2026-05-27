# TrackOps

TrackOps is a full-stack race operations platform inspired by Formula 1 engineering systems using Python, FastAPI, React, and telemetry ingestion pipelines.

The platform ingests telemetry and session data to support real-time race telemetry analysis, tire degredation monitoring, and strategy decision-support tooling for driver and stint comparison across race sessions.

## Features

- Real-time telemetry ingestion from OpenF1
- FastAPI backend for telemetry processing
- React + TypeScript frontend dashboard
- Driver and session selection
- Lap time trend visualization
- Multi-driver lap comparison
- Strategy alert generation
- Sector time analysis

## Tech Stack

Frontend:
- React
- TypeScript
- Vite
- Recharts

Backend:
- FastAPI
- Python
- Requests
- Pandas

Data Source:
- OpenF1 API

## Running Locally

### Backend

```bash
cd backend
source .venv/bin/activate
python3 -m uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Future Improvements

- Tire stint analysis
- Pit stop visualization
- Live telemetry streaming
- Driver pace delta calculations
- Predictive strategy modeling
- Race control event integration