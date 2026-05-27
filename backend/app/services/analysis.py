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