import requests
from functools import lru_cache

OPENF1_BASE = "https://api.openf1.org/v1"

# defines a function with a parameter
# year: int = 2024, means year is expeceted to be an integer
# default value is set to 2024
def fetch_sessions(year: int):
    # sending request to openf1
    # response starts an HTTP GET request
    response = requests.get(
        f"{OPENF1_BASE}/sessions", 
        params={"year": year}
    )
    # error handling, checks did the api request fail?
    # if openf1 returns 404, 500, etc then python throws an error
    # instead of silently continuing, important for debugging
    # without this, failures are harder to notice
    response.raise_for_status()
    return response.json()


def fetch_drivers(session_key: int):
    response = requests.get(
        f"{OPENF1_BASE}/drivers",
        params={"session_key": session_key}
    )
    response.raise_for_status()
    return response.json()

@lru_cache(maxsize=128)
def fetch_laps(session_key: int, driver_number: int):
    response = requests.get(
        f"{OPENF1_BASE}/laps",
        params={
            "session_key": session_key,
            "driver_number": driver_number
        }
    )
    response.raise_for_status()
    return response.json()