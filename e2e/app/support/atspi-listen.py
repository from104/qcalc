#!/usr/bin/env python3
"""AT-SPI listener for the app layer — hears what a screen reader would hear.

Prints one JSON line per `object:announcement` event (what the app's announce_a11y command emits through ATK,
src-tauri/src/lib.rs), plus `{"ready": true}` once registered. Runs on the test's private D-Bus session, so it
only ever sees the app under test.
"""
import json
import sys

import gi

gi.require_version("Atspi", "2.0")
from gi.repository import Atspi  # noqa: E402


def emit(payload):
    sys.stdout.write(json.dumps(payload, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def on_event(event):
    try:
        app = event.source.get_application()
        app_name = app.get_name() if app else None
    except Exception:  # the source may already be gone
        app_name = None
    emit({"type": event.type, "text": event.any_data, "app": app_name})


listener = Atspi.EventListener.new(on_event)
listener.register("object:announcement")
emit({"ready": True})
Atspi.event_main()
