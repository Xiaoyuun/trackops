from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.services.openf1_client import fetch_sessions, fetch_drivers, fetch_laps
from app.services.analysis import generate_lap_summary, analyze_laps, generate_strategy_alerts

# app is the actual backend server, everything is attached to app
# creates FastAPI application object
app = FastAPI(title="TrackOps API")

# CORS security system:
# frontend and backend are on different origins
# treated as different websites for security reasons
# this code tells fastAPI to allow reqests coming from react frontend on localhost
# on react frontend can send request to backend, and backend sends data to frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# first endpoint
# @app.get("/") is a decorator
# means when someone visits "/", run the function below
# .get() means endpoint responds to HTTP GET requests
# get = "give me data"
@app.get("/")
# this defines a python function names root, fastAPI will run this function when / is visited
def root():
    return {"message": "TrackOps backend is running"}

# @app.get("/sessions") creates another route
# now backend has /sessions endpoint available
@app.get("/sessions")
# defines a function with a parameter
# year: int = 2024, means year is expeceted to be an integer
# default value is set to 2024
def get_sessions(year: int = 2026):
    return fetch_sessions(year)

# creates drivers endpoint
@app.get("/drivers")
# requires a query parameter (session key)
# because of int, fastAPI automatically converts into integer
def get_drivers(session_key: int = 11291):
    return fetch_drivers(session_key)

# creates laps endpoint
@app.get("/laps")
# this endpoint requires two query parameters, both int
# example: /laps?session_key=9158&driver_number=81
def get_laps(session_key: int = 11291, driver_number: int = 81):
    return fetch_laps(session_key, driver_number)

# creates lap-summary endpoint/route
# summarizes data instead of passing it through unchanges (e.g. sessions, lap, drivers)
@app.get("/lap-summary")
# defines endpoint function get_lap_summary, takes two query parameters
def get_lap_summary(session_key: int = 11291, driver_number: int = 81):
    laps = fetch_laps(session_key, driver_number)
    return generate_lap_summary(laps)

# lap-analysis endpoint/route
@app.get("/lap-analysis")
def get_lap_analysis(session_key: int = 11291, driver_number: int = 81):
    laps = fetch_laps(session_key, driver_number)
    return analyze_laps(laps)

@app.get("/strategy-alerts")
def get_strategy_alerts(session_key: int = 11291, driver_number: int = 81):
    laps = fetch_laps(session_key, driver_number)
    return generate_strategy_alerts(laps)