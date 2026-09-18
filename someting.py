#!/usr/bin/env python3
"""
AIMBOT v2.0 — serial capture

Records the CSV stream from the Pico (running the jitter-log build) into a
file, with an on-screen phase timer so you know when to switch from
holding still to shaking to swinging.

USAGE
    python capture_serial.py                       # auto-detect port, 60 s
    python capture_serial.py --list                # show available ports
    python capture_serial.py --port COM5 --secs 60
    python capture_serial.py --port /dev/ttyACM0 --out run2.csv

REQUIREMENTS
    pip install pyserial
"""

import argparse
import sys
import time

try:
    import serial
    from serial.tools import list_ports
except ImportError:
    sys.exit("Missing dependency. Run:  pip install pyserial")


# Phase boundaries as fractions of the total capture, matching the test
# protocol in the firmware patch.
PHASES = [
    (0.00, 0.33, "PHASE 1 -- HOLD STILL     (aim at a fixed point, steady as you can)"),
    (0.33, 0.66, "PHASE 2 -- SIMULATED TREMOR (keep aiming, let your hand shake)"),
    (0.66, 1.01, "PHASE 3 -- FAST SWINGS    (big target-to-target flicks)"),
]


def find_port(explicit=None):
    if explicit:
        return explicit
    ports = list(list_ports.comports())
    if not ports:
        sys.exit("No serial ports found. Is the Pico plugged in and flashed "
                 "with JITTER_LOG set to 1?")
    # Prefer anything that looks like a Pico / RP2040 CDC device.
    for p in ports:
        blob = f"{p.description} {p.manufacturer or ''} {p.hwid}".lower()
        if any(k in blob for k in ("pico", "rp2040", "raspberry", "2e8a")):
            return p.device
    # Otherwise fall back to the first ACM/USB-ish port.
    for p in ports:
        if "acm" in p.device.lower() or "usb" in p.device.lower():
            return p.device
    return ports[0].device


def show_ports():
    ports = list(list_ports.comports())
    if not ports:
        print("No serial ports found.")
        return
    print("Available ports:")
    for p in ports:
        print(f"  {p.device:20s}  {p.description}")


def phase_for(elapsed, total):
    frac = elapsed / total if total else 0.0
    for lo, hi, label in PHASES:
        if lo <= frac < hi:
            return label
    return PHASES[-1][2]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", default=None, help="serial port (auto-detected if omitted)")
    ap.add_argument("--baud", type=int, default=115200,
                    help="ignored by native USB CDC, kept for compatibility")
    ap.add_argument("--secs", type=float, default=60.0, help="capture duration in seconds")
    ap.add_argument("--out", default="aimbot_log.csv", help="output CSV path")
    ap.add_argument("--list", action="store_true", help="list serial ports and exit")
    args = ap.parse_args()

    if args.list:
        show_ports()
        return

    port = find_port(args.port)
    print(f"Port    : {port}")
    print(f"Output  : {args.out}")
    print(f"Duration: {args.secs:.0f} s\n")

    try:
        ser = serial.Serial(port, args.baud, timeout=1)
    except Exception as e:
        sys.exit(f"Could not open {port}: {e}\n"
                 f"Close the Arduino Serial Monitor if it is open, then retry.")

    # Let the board settle, then flush whatever partial line is buffered.
    time.sleep(1.5)
    ser.reset_input_buffer()

    for n in (3, 2, 1):
        print(f"  starting in {n}...", end="\r", flush=True)
        time.sleep(1)
    print("  GO. Follow the phase prompts below.          \n")

    header = "t_us,raw_x,raw_y,filt_x,filt_y,clutch"
    rows = 0
    bad = 0
    t0 = time.time()
    last_phase = None

    try:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(header + "\n")
            while True:
                elapsed = time.time() - t0
                if elapsed >= args.secs:
                    break

                ph = phase_for(elapsed, args.secs)
                if ph != last_phase:
                    print(f"\n>>> {ph}\n")
                    last_phase = ph

                raw = ser.readline()
                if not raw:
                    continue
                line = raw.decode("utf-8", errors="ignore").strip()
                if not line:
                    continue
                # Skip the board's own header line and any boot chatter.
                if line.startswith("t_us") or not line[0].isdigit():
                    continue
                if line.count(",") != 5:
                    bad += 1
                    continue
                f.write(line + "\n")
                rows += 1

                if rows % 40 == 0:
                    remain = max(0.0, args.secs - elapsed)
                    print(f"    {rows:6d} samples | {remain:4.0f}s left",
                          end="\r", flush=True)
    except KeyboardInterrupt:
        print("\nStopped early by user.")
    finally:
        ser.close()

    dur = time.time() - t0
    rate = rows / dur if dur else 0
    print(f"\n\nDone. {rows} samples in {dur:.1f} s  (~{rate:.0f} Hz) -> {args.out}")
    if bad:
        print(f"Skipped {bad} malformed lines (normal: a few at startup).")

    if rows < 500:
        print("\nWARNING: very few samples. Check that JITTER_LOG is 1, that "
              "jitterLogSample() is actually being called in loop(), and that "
              "nothing else has the port open.")
    else:
        print(f"\nNext:  python analyze_jitter.py {args.out}")


if __name__ == "__main__":
    main()