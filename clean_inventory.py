import json
from datetime import datetime, timedelta

INPUT_FILE = "inventory_dec.json"
OUTPUT_FILE = "inventory_dec_updated.json"
OLD_START_DATE = "2025-08-04"
NEW_START_DATE = "2025-01-01"
DATE_FORMAT = "%Y-%m-%d"

def shift_dates(data, old_start, new_start):
    old_start_dt = datetime.strptime(old_start, DATE_FORMAT)
    new_start_dt = datetime.strptime(new_start, DATE_FORMAT)
    date_diff = new_start_dt - old_start_dt

    def update_date(date_str):
        try:
            dt = datetime.strptime(date_str, DATE_FORMAT)
            new_dt = dt + date_diff
            return new_dt.strftime(DATE_FORMAT)
        except Exception:
            return date_str

    if isinstance(data, dict):
        for k, v in data.items():
            if k == "startDate" and v == old_start:
                data[k] = new_start
            elif isinstance(v, str) and v == old_start:
                data[k] = new_start
            elif isinstance(v, str):
                data[k] = update_date(v)
            else:
                data[k] = shift_dates(v, old_start, new_start)
    elif isinstance(data, list):
        for i in range(len(data)):
            if isinstance(data[i], str):
                data[i] = update_date(data[i])
            else:
                data[i] = shift_dates(data[i], old_start, new_start)
    return data

def main():
    with open(INPUT_FILE, "r") as f:
        data = json.load(f)

    updated_data = shift_dates(data, OLD_START_DATE, NEW_START_DATE)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(updated_data, f, indent=2)

if __name__ == "__main__":
    main()