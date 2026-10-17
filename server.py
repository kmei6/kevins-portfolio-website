#!/usr/bin/env python3
"""Small loopback-only server for the local portfolio and project uploads."""

from email import policy
from email.parser import BytesParser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import mimetypes
from pathlib import Path
import re
import unicodedata
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent
PROJECTS_DIR = ROOT / "projects"
THUMBNAILS_DIR = PROJECTS_DIR / "thumbnails"
PRESENTATIONS_DIR = PROJECTS_DIR / "presentations"
MANIFEST = PROJECTS_DIR / "projects.json"
PASSWORD = "kmei6"
MAX_UPLOAD_BYTES = 100 * 1024 * 1024


def load_projects():
    try:
        data = json.loads(MANIFEST.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (OSError, json.JSONDecodeError):
        return []


def project_slug(name):
    ascii_name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", ascii_name.lower())).strip("-") or "project"


class PortfolioHandler(BaseHTTPRequestHandler):
    server_version = "LocalPortfolio/1.0"

    def send_bytes(self, status, payload, content_type, *, cache="no-store"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", cache)
        self.end_headers()
        self.wfile.write(payload)

    def send_json(self, status, data):
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_bytes(status, payload, "application/json; charset=utf-8")

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == "/api/projects":
            self.send_json(200, load_projects())
            return

        relative = unquote(path).lstrip("/") or "index.html"
        target = (ROOT / relative).resolve()
        if ROOT not in target.parents or not target.is_file():
            self.send_error(404, "File not found")
            return

        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        try:
            self.send_bytes(200, target.read_bytes(), content_type, cache="no-cache")
        except OSError:
            self.send_error(404, "File not found")

    def do_POST(self):
        if urlsplit(self.path).path != "/api/projects":
            self.send_error(404, "Endpoint not found")
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_json(400, {"error": "Invalid upload size."})
            return
        if length <= 0 or length > MAX_UPLOAD_BYTES:
            self.send_json(413, {"error": "Choose files with a combined size under 100 MB."})
            return

        content_type = self.headers.get("Content-Type", "")
        if not content_type.lower().startswith("multipart/form-data"):
            self.send_json(400, {"error": "Upload the project using the form."})
            return

        try:
            body = self.rfile.read(length)
            headers = (
                f"Content-Type: {content_type}\r\n"
                "MIME-Version: 1.0\r\n\r\n"
            ).encode("ascii")
            message = BytesParser(policy=policy.default).parsebytes(headers + body)
            fields = {}
            files = {}
            for part in message.iter_parts():
                field_name = part.get_param("name", header="content-disposition")
                if not field_name:
                    continue
                payload = part.get_payload(decode=True) or b""
                filename = part.get_filename()
                if filename:
                    files[field_name] = (filename, payload)
                else:
                    charset = part.get_content_charset() or "utf-8"
                    fields[field_name] = payload.decode(charset, errors="replace").strip()

            name = fields.get("name", "").strip()
            if fields.get("password") != PASSWORD:
                self.send_json(403, {"error": "hahahahah this isnt your site"})
                return
            if not name or len(name) > 80:
                self.send_json(400, {"error": "Enter a project name of 1 to 80 characters."})
                return
            if "thumbnail" not in files or "presentation" not in files:
                self.send_json(400, {"error": "Choose both a JPG thumbnail and a PDF presentation."})
                return

            _, thumbnail = files["thumbnail"]
            _, presentation = files["presentation"]
            if not thumbnail.startswith(b"\xff\xd8\xff"):
                self.send_json(400, {"error": "The thumbnail must be a valid JPG image."})
                return
            if not presentation.startswith(b"%PDF-"):
                self.send_json(400, {"error": "The presentation must be a valid PDF."})
                return

            THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
            PRESENTATIONS_DIR.mkdir(parents=True, exist_ok=True)
            base = project_slug(name)
            slug = base
            counter = 2
            while (THUMBNAILS_DIR / f"{slug}.jpg").exists() or (PRESENTATIONS_DIR / f"{slug}.pdf").exists():
                slug = f"{base}-{counter}"
                counter += 1

            thumbnail_path = THUMBNAILS_DIR / f"{slug}.jpg"
            presentation_path = PRESENTATIONS_DIR / f"{slug}.pdf"
            project = {
                "name": name,
                "thumbnail": f"/projects/thumbnails/{slug}.jpg",
                "presentation": f"/projects/presentations/{slug}.pdf",
            }
            try:
                thumbnail_path.write_bytes(thumbnail)
                presentation_path.write_bytes(presentation)
                projects = load_projects()
                projects.append(project)
                temp_manifest = MANIFEST.with_suffix(".json.tmp")
                temp_manifest.write_text(json.dumps(projects, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                temp_manifest.replace(MANIFEST)
            except OSError:
                thumbnail_path.unlink(missing_ok=True)
                presentation_path.unlink(missing_ok=True)
                self.send_json(500, {"error": "Could not save the uploaded files into the project folders."})
                return

            self.send_json(201, {"project": project})
        except (UnicodeError, ValueError, OSError) as error:
            self.send_json(400, {"error": f"Could not process the upload: {error}"})

    def log_message(self, format_string, *args):
        print(f"[{self.log_date_time_string()}] {format_string % args}")


if __name__ == "__main__":
    address = ("127.0.0.1", 8000)
    server = ThreadingHTTPServer(address, PortfolioHandler)
    print("Kevin's portfolio is available at http://127.0.0.1:8000/projects.html")
    print("Keep this window open while you use project uploads. Press Ctrl+C to stop the server.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nPortfolio server stopped.")
    finally:
        server.server_close()
