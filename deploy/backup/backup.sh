#!/bin/sh
set -eu
umask 077

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY is required}"
: "${R2_ENDPOINT:?R2_ENDPOINT is required}"
: "${R2_ACCESS_KEY_ID:?R2_ACCESS_KEY_ID is required}"
: "${R2_SECRET_ACCESS_KEY:?R2_SECRET_ACCESS_KEY is required}"
: "${R2_BUCKET:?R2_BUCKET is required}"

BACKUP_PREFIX="${BACKUP_PREFIX:-postgresql}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
WORKDIR="$(mktemp -d)"
RCLONE_CONFIG_FILE="$WORKDIR/rclone.conf"
DUMP_FILE="$WORKDIR/cofound-${TIMESTAMP}.dump"
ENCRYPTED_FILE="$DUMP_FILE.enc"
CHECKSUM_FILE="$ENCRYPTED_FILE.sha256"

cleanup() {
  rm -rf "$WORKDIR"
}
trap cleanup EXIT INT TERM

cat > "$RCLONE_CONFIG_FILE" <<EOF
[r2]
type = s3
provider = Cloudflare
access_key_id = $R2_ACCESS_KEY_ID
secret_access_key = $R2_SECRET_ACCESS_KEY
endpoint = $R2_ENDPOINT
acl = private
EOF

pg_dump --format=custom --no-owner --no-privileges "$DATABASE_URL" > "$DUMP_FILE"
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 600000 \
  -in "$DUMP_FILE" \
  -out "$ENCRYPTED_FILE" \
  -pass env:BACKUP_ENCRYPTION_KEY
sha256sum "$ENCRYPTED_FILE" > "$CHECKSUM_FILE"

REMOTE_PATH="r2:${R2_BUCKET}/${BACKUP_PREFIX}/cofound-${TIMESTAMP}.dump.enc"
rclone --config "$RCLONE_CONFIG_FILE" copyto "$ENCRYPTED_FILE" "$REMOTE_PATH" --s3-no-check-bucket
rclone --config "$RCLONE_CONFIG_FILE" copyto "$CHECKSUM_FILE" "${REMOTE_PATH}.sha256" --s3-no-check-bucket
rclone --config "$RCLONE_CONFIG_FILE" copyto "$ENCRYPTED_FILE" "r2:${R2_BUCKET}/${BACKUP_PREFIX}/latest.dump.enc" --s3-no-check-bucket
rclone --config "$RCLONE_CONFIG_FILE" copyto "$CHECKSUM_FILE" "r2:${R2_BUCKET}/${BACKUP_PREFIX}/latest.dump.enc.sha256" --s3-no-check-bucket

printf '%s\n' "Backup uploaded: ${BACKUP_PREFIX}/cofound-${TIMESTAMP}.dump.enc"
