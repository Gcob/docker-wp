# Docker WP

Run multiple WordPress sites using nginx, php-fpm, mariadb and docker-compose.

## Pre-requisites

- [Node.js](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/get-docker/)

### Node.js

For Node.js, I personally recommend using NVM (Node Version Manager) to manage your Node.js versions.
Download one of the following:

- [NVM github installation](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating
- [Node.js download](https://nodejs.org/en/download/)

Make sure you have node.js installed by running:

```bash
node -v
```

### Docker

I personally do not use the Docker Desktop App, but if you are not familiar with Docker,
I strongly recommend to install the desktop app to get started.
Download one of the following:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker](https://docs.docker.com/engine/install/)

Make sure you have Docker and Docker Compose installed by running:

```bash
docker -v
docker compose version
```

## Installation

Install `docker-wp-cli` globally:

```bash
npm install -g docker-wp-cli
```

Or update

```bash
npm update -g docker-wp-cli
```

## Commands

- `dwpc config` - Small Wizard to help you configure the project.
- `dwpc up` - Start the project.
- `dwpc down` - Stop the project.
- `dwpc restart` - Restart the project.

## Development

Local development is done using the `docker-wp` CLI tool.

```bash
npm install -g .
```

