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