import json
from datetime import datetime, timedelta
from typing import List

def generate_availabilities(
    tour_ids: List[int],
    vendor_ids: List[int],
    date_start: str,           # e.g. "2025-07-31"
    date_end: str,             # e.g. "2025-08-02"
    time_range_start: str,     # e.g. "08:00:00"
    time_range_end: str        # e.g. "10:00:00"
):
    date_format = "%Y-%m-%d"
    time_format = "%H:%M:%S"

    start_date = datetime.strptime(date_start, date_format)
    end_date = datetime.strptime(date_end, date_format)
    delta_day = timedelta(days=1)

    start_time = datetime.strptime(time_range_start, time_format).time()
    end_time = datetime.strptime(time_range_end, time_format).time()

    # generate all dates in range
    availabilities = []
    current_date = start_date

    while current_date <= end_date:
        time_cursor = datetime.combine(current_date, start_time)
        day_end_time = datetime.combine(current_date, end_time)

        while time_cursor <= day_end_time:
            start_time_str = time_cursor.strftime(time_format)
            end_time_str = (time_cursor + timedelta(hours=3)).strftime(time_format)
            date_str = current_date.strftime(date_format)

            for tour_id in tour_ids:
                for vendor_id in vendor_ids:
                    availability_item = {
                        "startDate": date_str,
                        "startTime": start_time_str,
                        "tourId": tour_id,
                        "vendorId": vendor_id,
                        "endTime": end_time_str,
                        "price": 100,
                    }
                    availabilities.append(availability_item)

            time_cursor += timedelta(minutes=15)
        current_date += delta_day

    final_json = dict()
    final_json['availabilities'] = availabilities
    # Write to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"availabilities_{timestamp}.json"
    with open(filename, "w") as f:
        json.dump(final_json, f, indent=2)
    print(f"Generated {len(availabilities)} items into {filename}")

# Example usage:
if __name__ == "__main__":
    generate_availabilities(
        tour_ids=[69117, 69118],
        vendor_ids=[3946, 3947],
        date_start="2025-07-01",
        date_end="2025-08-1",
        time_range_start="08:00:00",
        time_range_end="10:00:00"
    )
