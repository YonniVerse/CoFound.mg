#!/bin/sh
set -eu
umask 077

: "${RESTORE_DATABASE_URL:?RESTORE_DATABASE_URL is required and must point to a disposable database}"
: "${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY is required}"
: "${R2_ENDPOINT:?R2_ENDPOINT is required}"
: "${R2_ACCESS_KEY_ID:?R2_ACCESS_KEY_ID is required}"
: "${R2_SECRET_ACCESS_KEY:?R2_SECRET_ACCESS_KEY is required}"
: "${R2_BUCKET:?R2_BUCKET is required}"

BACKUP_PREFIX="${BACKUP_PREFIX:-postgresql}"
BACKUP_OBJECT="${BACKUP_OBJECT:-${BACKUP_PREFIX}/latest.dump.enc}"
WORKDIR="$(mktemp -d)"
RCLONE_CONFIG_FILE="$WORKDIR/rclone.conf"
ENCRYPTED_FILE="$WORKDIR/restore.dump.enc"
CHECKSUM_FILE="$WORKDIR/restore.dump.enc.sha256"
DUMP_FILE="$WORKDIR/restore.dump"

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

rclone --config "$RCLONE_CONFIG_FILE" copyto "r2:${R2_BUCKET}/${BACKUP_OBJECT}" "$ENCRYPTED_FILE" --s3-no-check-bucket
rclone --config "$RCLONE_CONFIG_FILE" copyto "r2:${R2_BUCKET}/${BACKUP_OBJECT}.sha256" "$CHECKSUM_FILE" --s3-no-check-bucket
(cd "$WORKDIR" && sha256sum -c "$(basename "$CHECKSUM_FILE")")
openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 \
  -in "$ENCRYPTED_FILE" \
  -out "$DUMP_FILE" \
  -pass env:BACKUP_ENCRYPTION_KEY
pg_restore --exit-on-error --single-transaction --clean --if-exists \
  --no-owner --no-privileges --dbname="$RESTORE_DATABASE_URL" "$DUMP_FILE"

printf '%s\n' "Restore test passed for ${BACKUP_OBJECT}"
