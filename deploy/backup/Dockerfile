FROM alpine:3.22

RUN apk add --no-cache openssl postgresql16-client rclone

COPY backup.sh restore-test.sh /usr/local/bin/
RUN chmod 0755 /usr/local/bin/backup.sh /usr/local/bin/restore-test.sh

ENTRYPOINT ["/usr/local/bin/backup.sh"]
