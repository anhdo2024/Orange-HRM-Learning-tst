FROM node:22-bookworm

ARG RUNNER_VERSION=2.336.0
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates curl git gnupg jq tar unzip docker.io \
    && install -d -m 0755 /etc/apt/keyrings \
    && curl -fsSL https://dl.google.com/linux/linux_signing_key.pub \
       | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" \
       > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable firefox-esr \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash runner
RUN mkdir -p /opt/actions-runner \
    && curl -fsSL -o /tmp/actions-runner.tar.gz \
       "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" \
    && tar -xzf /tmp/actions-runner.tar.gz -C /opt/actions-runner \
    && rm /tmp/actions-runner.tar.gz \
    && chown -R runner:runner /opt/actions-runner
WORKDIR /opt/orange-hrm

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
COPY runner-entrypoint.sh /usr/local/bin/runner-entrypoint.sh
RUN chmod +x /usr/local/bin/runner-entrypoint.sh \
    && chown -R runner:runner /opt/orange-hrm /usr/local/bin/runner-entrypoint.sh

USER root
WORKDIR /opt/orange-hrm
ENTRYPOINT ["/usr/local/bin/runner-entrypoint.sh"]
