def generate_lap_summary(laps: list):
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

def analyze_laps(laps: list):
    valid_laps = []

    for lap in laps:
        lap_time = lap.get("lap_duration")

        if lap_time is not None:
            valid_laps.append(lap_time)

    if not valid_laps:
        return {"error": "No valid laps found"}

    fastest_lap = min(valid_laps)
    average_lap = sum(valid_laps) / len(valid_laps)

    return {
        "total_laps": len(valid_laps),
        "fastest_lap": round(fastest_lap, 3),
        "average_lap": round(average_lap, 3)
    }

# defines a function called generate_strategy_alerts
# expects laps, a python list with raw openf1 lap data
def generate_strategy_alerts(laps: list):
    # create empty list that will filter thru laps for only valid ones
    valid_laps = []

    for lap in laps:
        lap_time = lap.get("lap_duration")
        
        # pit out laps are slow and unrepresentative, don't include
        if lap_time is not None and lap.get("is_pit_out_lap") is not True:
            valid_laps.append({
                "lap_number": lap.get("lap_number"),
                "lap_duration": lap_time,
                "is_pit_out_lap": lap.get("is_pit_out_lap")
            })

    if len(valid_laps) < 5:
        return {
            "alerts": [],
            "message": "Not enough valid lap data to generate strategy alerts"
        }

    all_lap_times = [lap["lap_duration"] for lap in valid_laps]
    # take last three items
    recent_lap_times = all_lap_times[-3:]

    average_lap = sum(all_lap_times) / len(all_lap_times)
    recent_average = sum(recent_lap_times) / len(recent_lap_times)

    alerts = []

    # means recent pace is more than 0.8 seconds slower than overall average
    # add full structured alert to alerts dictionary to alert to pace drop
    if recent_average > average_lap + 0.8:
        alerts.append({
            "type": "PACE_DROP",
            "severity": "medium",
            "message": "Recent lap pace is more than 0.8s slower than average."
        })

    # if theres lao time variance detected
    # can indicate tire degredation, traffic, mistakes, unstable pace
    if max(recent_lap_times) - min(recent_lap_times) > 1.0:
        alerts.append({
            "type": "LAP_TIME_VARIANCE",
            "severity": "low",
            "message": "Recent lap times show high variance."
        })

    pit_laps = [
        lap.get("lap_number")
        for lap in laps
        if lap.get("is_pit_out_lap") is True
    ]

    # send back laps that were pit out laps (naturally slower and unrepresentative)
    if pit_laps:
        alerts.append({
            "type": "PIT_EVENT",
            "severity": "info",
            "message": f"Pit out laps detected: {pit_laps}"
        })

    return {
        "average_lap": round(average_lap, 3),
        "recent_average": round(recent_average, 3),
        "alerts": alerts
    }