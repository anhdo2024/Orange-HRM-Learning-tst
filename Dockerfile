FROM node:22-bookworm

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
WORKDIR /opt/orange-hrm

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN chown -R runner:runner /opt/orange-hrm

USER runner
WORKDIR /opt/orange-hrm
CMD ["tail", "-f", "/dev/null"]
