#!/usr/bin/env python3
"""X11 CLIPBOARD owner/reader for the app layer — a process *outside* the app, like a real user's other program.

Xvfb has no clipboard manager, so whoever sets the clipboard must stay alive to serve it. This helper does,
for the lifetime of the test worker. It speaks JSON lines on stdin/stdout:

  {"op": "set", "text": "..."}   -> {"ok": true}              (this process now owns CLIPBOARD)
  {"op": "get"}                  -> {"ok": true, "text": ...}  (text, or null when the owner offers no text)

Runs inside the isolated session (DISPLAY = the test Xvfb), never on the user's desktop.
"""
import json
import sys

import gi

gi.require_version("Gtk", "3.0")
gi.require_version("Gdk", "3.0")
from gi.repository import Gdk, GLib, Gtk  # noqa: E402

clipboard = Gtk.Clipboard.get(Gdk.SELECTION_CLIPBOARD)


def reply(payload):
    sys.stdout.write(json.dumps(payload) + "\n")
    sys.stdout.flush()


def on_text(_clipboard, text):
    reply({"ok": True, "text": text})


def on_line(source, condition):
    if condition & (GLib.IO_HUP | GLib.IO_ERR):
        Gtk.main_quit()
        return False
    line = source.readline()
    if not line:
        Gtk.main_quit()
        return False
    try:
        req = json.loads(line)
        if req.get("op") == "set":
            clipboard.set_text(req.get("text", ""), -1)
            reply({"ok": True})
        elif req.get("op") == "get":
            # asynchronous: the answer comes from the current owner (maybe the app) through the main loop
            clipboard.request_text(on_text)
        else:
            reply({"ok": False, "error": f"unknown op {req.get('op')!r}"})
    except Exception as error:  # report, keep serving
        reply({"ok": False, "error": str(error)})
    return True


GLib.io_add_watch(sys.stdin, GLib.IO_IN | GLib.IO_HUP | GLib.IO_ERR, on_line)
reply({"ok": True, "ready": True})
Gtk.main()
