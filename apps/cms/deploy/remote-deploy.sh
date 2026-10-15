#!/usr/bin/env bash
#
# Runs on the CMS host, as root, sent by .github/workflows/deploy-cms.yml
# through SSM Run Command. Not meant to be run from a laptop.
#
#   remote-deploy.sh <image-uri> <release-dir> <preview-url>
#
# <release-dir> holds this release's compose.prod.yaml and Caddyfile, which
# the workflow uploaded to S3 and the command downloaded. Copying them in on
# every deploy keeps the host's copies identical to the commit being shipped.
#
# <preview-url> is the frontend origin the admin's Preview pane opens (the
# CMS_PREVIEW_URL repo variable). It has to be the site that reads from this
# CMS, or Preview shows a site that has never seen these drafts.
#
# Secrets in .env.production and the three data volumes are never touched.

set -euo pipefail

image="$1"
release_dir="$2"
preview_url="$3"
app_dir=/opt/dummy-lab-cms
# Snap installs the AWS CLI outside the PATH that Run Command gives the shell.
aws=/snap/bin/aws

cd "$app_dir"
compose=(docker compose -f compose.prod.yaml --env-file .env.production)

cp "$release_dir/compose.prod.yaml" "$release_dir/Caddyfile" .

# Record the image in .env.production so manual `docker compose` commands on
# the host run the same image the pipeline shipped, not whatever was last
# pulled.
sed -i '/^CMS_IMAGE=/d' .env.production
echo "CMS_IMAGE=$image" >> .env.production

# Read at boot by both the preview handler (config/admin.ts) and the
# frame-src CSP (config/middlewares.ts). A changed value changes the env
# file, so `up` below recreates Strapi with it.
sed -i '/^CLIENT_URL=/d' .env.production
echo "CLIENT_URL=$preview_url" >> .env.production

# The registry is the host part of the image URI. ECR logins last 12 hours,
# so one per deploy is plenty.
"$aws" ecr get-login-password --region us-east-1 |
  docker login --username AWS --password-stdin "${image%%/*}"

"${compose[@]}" pull strapi

# --wait blocks until every service with a healthcheck is healthy, so a
# Strapi that fails to boot fails the deploy. Postgres and Caddy are only
# recreated if their own definitions changed.
"${compose[@]}" up -d --wait --wait-timeout 300

# `up` doesn't restart Caddy for a changed bind-mounted Caddyfile. Reloading
# is a no-op when nothing changed and drops no connections.
"${compose[@]}" exec -T caddy caddy reload --config /etc/caddy/Caddyfile

# Every deploy leaves the previous image behind. The running containers keep
# theirs, so this only removes images nothing is using.
docker image prune -af

"${compose[@]}" ps
