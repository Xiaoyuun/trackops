from fastapi import FastAPI
import requests

# app is the actual backend server, everything is attached to app
# creates FastAPI application object
app = FastAPI(title="TrackOps API")

# OPENF1_BASE is a variable storing base URL for OpenF1 API
# makes code cleaner, easier to update later
OPENF1_BASE = "https://api.openf1.org/v1"

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
def get_sessions(year: int = 2024):
    # most important line
    # backend is now making an HTTP request to OpenF1
    response = requests.get(
        # an f string, URL becomes https://api.openf1.org/v1/sessions
        f"{OPENF1_BASE}/sessions", 
        # adds ?year=2024 onto URL
        params={"year": year}
    )
    # error handling, checks did the api request fail?
    # if openf1 returns 404, 500, etc then python throws an error
    # instead of silently continuing, important for debugging
    # without this, failures are harder to notice
    response.raise_for_status()
    # converts the api response into python data aka a list or dictionary
    # and fastAPI automatically converts it back into JSON for frontend/browser
    return response.json()

# creates drivers endpoint
@app.get("/drivers")
# requires a query parameter (session key)
# because of int, fastAPI automatically converts into integer
def get_drivers(session_key: int = 9488):
    # calls OpenF1s drivers endpoint filtered by sessions
    response = requests.get(
        f"{OPENF1_BASE}/drivers", 
        params={"session_key": session_key}
    )
    response.raise_for_status()
    return response.json()

# creates laps endpoint
@app.get("/laps")
# this endpoint requires two query parameters, both int
# example: /laps?session_key=9158&driver_number=81
def get_laps(session_key: int = 9488, driver_number: int = 81):
    response = requests.get(
        f"{OPENF1_BASE}/laps",
        params={"session_key": session_key, "driver_number": driver_number}
    )
    response.raise_for_status()
    return response.json()

# creates lap-summary endpoint/route
# summarizes data instead of passing it through unchanges (e.g. sessions, lap, drivers)
@app.get("/lap-summary")
# defines endpoint function get_lap_summary, takes two query parameters
def get_lap_summary(session_key: int = 9488, driver_number: int = 81):
    # sending request to openf1
    # response starts an HTTP GET request
    response = requests.get(
        f"{OPENF1_BASE}/laps",
        params={
            "session_key": session_key,
            "driver_number": driver_number
        }
    )

    # error checking
    # this checks whether the API request failed (404,500,etc) then python raises an exception
    response.raise_for_status()

    # convert JSON to python
    # laps = actual python data structure
    laps = response.json()
    # laps is now a python list of dictionaries
    # each lap is a dictionary (python version of a json object)

    summary = []

    for lap in laps:
        summary.append({
            "lap_number": lap.get("lap_number"),
            "lap_duration": lap.get("lap_duration"),
            "sector_1": lap.get("duration_sector_1"),
            "sector_2": lap.get("duration_sector_2"),
            "sector_3": lap.get("duration_sector_3"),
            "is_pit_out_lap": lap.get("is_pit_out_lap")
        })

    # fastAPI converst python list into json automatically
    # so browser receives structured JSON
    return summary