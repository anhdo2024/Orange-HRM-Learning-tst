"""Minimal webhook-driven manager for one-shot GitHub Actions runners."""

import hashlib
import hmac
import json
import logging
import os
import socket
import threading
import time
from http import HTTPStatus
from http.client import HTTPConnection
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen


logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
LOG = logging.getLogger("runner-manager")

REPOSITORY = os.environ["GITHUB_REPOSITORY"]
GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
RUNNER_IMAGE = os.getenv("RUNNER_IMAGE", "orange-ephemeral-runner:latest")
RUNNER_LABELS = os.getenv("RUNNER_LABELS", "docker-ephemeral")
MAX_RUNNERS = int(os.getenv("MAX_RUNNERS", "10"))
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "")
DOCKER_SOCKET = os.getenv("DOCKER_SOCKET", "/var/run/docker.sock")
DOCKER_API_VERSION = os.getenv("DOCKER_API_VERSION", "v1.45")


class UnixHTTPConnection(HTTPConnection):
    def connect(self):
        self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.sock.connect(DOCKER_SOCKET)


def docker_request(method, path, body=None):
    connection = UnixHTTPConnection("localhost")
    payload = None if body is None else json.dumps(body).encode()
    headers = {"Content-Type": "application/json"} if payload else {}
    connection.request(method, f"/{DOCKER_API_VERSION}{path}", payload, headers)
    response = connection.getresponse()
    data = response.read()
    connection.close()
    if response.status >= 300:
        raise RuntimeError(f"Docker API {response.status}: {data.decode(errors='replace')}")
    return json.loads(data) if data else None


def github_request(method, path, body=None):
    payload = None if body is None else json.dumps(body).encode()
    request = Request(
        f"https://api.github.com{path}",
        data=payload,
        method=method,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
        },
    )
    with urlopen(request, timeout=30) as response:
        data = response.read()
        return json.loads(data) if data else {}


def registration_token():
    return github_request(
        "POST", f"/repos/{REPOSITORY}/actions/runners/registration-token"
    )["token"]


def managed_containers():
    filters = json.dumps({"label": ["com.project.runner-managed=true"]})
    return docker_request("GET", f"/containers/json?all=true&filters={quote(filters)}")


def create_runner(job_id):
    containers = managed_containers()
    if any(
        container.get("Labels", {}).get("com.project.runner-job-id") == str(job_id)
        for container in containers
    ):
        LOG.info("Runner for job %s already exists", job_id)
        return
    if len(containers) >= MAX_RUNNERS:
        LOG.warning("Runner limit reached; leaving job %s queued", job_id)
        return

    name = f"runner-{job_id}"
    token = registration_token()
    config = {
        "Image": RUNNER_IMAGE,
        "Env": [
            f"GITHUB_REPOSITORY={REPOSITORY}",
            f"RUNNER_TOKEN={token}",
            f"RUNNER_NAME={name}",
            f"RUNNER_LABELS={RUNNER_LABELS}",
        ],
        "Labels": {
            "com.project.runner-managed": "true",
            "com.project.runner-job-id": str(job_id),
        },
        "HostConfig": {
            "Binds": ["/var/run/docker.sock:/var/run/docker.sock"],
            "AutoRemove": False,
        },
    }
    result = docker_request("POST", f"/containers/create?name={quote(name)}", config)
    docker_request("POST", f"/containers/{result['Id']}/start")
    LOG.info("Created ephemeral runner %s for job %s", name, job_id)


def remove_runner(job_id):
    for container in managed_containers():
        labels = container.get("Labels", {})
        if labels.get("com.project.runner-job-id") == str(job_id):
            container_id = container["Id"]
            try:
                docker_request("POST", f"/containers/{container_id}/stop?t=10")
            except RuntimeError:
                pass
            docker_request("DELETE", f"/containers/{container_id}?force=true")
            LOG.info("Removed runner for completed job %s", job_id)


def verify_signature(handler, body):
    if not WEBHOOK_SECRET:
        return True
    received = handler.headers.get("X-Hub-Signature-256", "")
    expected = "sha256=" + hmac.new(
        WEBHOOK_SECRET.encode(), body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(received, expected)


class WebhookHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if urlparse(self.path).path == "/health":
            self.send_response(HTTPStatus.OK)
            self.end_headers()
            self.wfile.write(b"ok\n")
            return
        self.send_error(HTTPStatus.NOT_FOUND)

    def do_POST(self):
        if urlparse(self.path).path != "/webhook":
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length)
        if not verify_signature(self, body):
            self.send_error(HTTPStatus.UNAUTHORIZED)
            return
        try:
            payload = json.loads(body)
            event = self.headers.get("X-GitHub-Event", "")
            job = payload.get("workflow_job", {})
            job_id = job.get("id")
            action = payload.get("action")
            if event == "workflow_job" and job_id:
                if action == "queued":
                    threading.Thread(target=create_runner, args=(job_id,), daemon=True).start()
                elif action in {"completed", "cancelled"}:
                    threading.Thread(target=remove_runner, args=(job_id,), daemon=True).start()
            self.send_response(HTTPStatus.ACCEPTED)
            self.end_headers()
        except Exception:
            LOG.exception("Webhook processing failed")
            self.send_error(HTTPStatus.BAD_REQUEST)

    def log_message(self, fmt, *args):
        LOG.info("%s - %s", self.address_string(), fmt % args)


def cleanup_loop():
    while True:
        time.sleep(60)
        try:
            for container in managed_containers():
                if container.get("State") == "exited":
                    docker_request("DELETE", f"/containers/{container['Id']}?force=true")
        except Exception:
            LOG.exception("Cleanup loop failed")


if __name__ == "__main__":
    threading.Thread(target=cleanup_loop, daemon=True).start()
    server = ThreadingHTTPServer(("0.0.0.0", int(os.getenv("PORT", "8080"))), WebhookHandler)
    LOG.info("Runner manager listening on port %s", os.getenv("PORT", "8080"))
    server.serve_forever()
