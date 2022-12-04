FROM alpine:latest

ARG PB_VERSION=0.8.0
ENV PB_ENCRYPTION_KEY=$PB_ENCRYPTION_KEY

RUN apk add --no-cache \
    unzip \
    # this is needed only if you want to use scp to copy later your pb_data locally
    openssh

# download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

EXPOSE 8080

# start PocketBase
CMD /pb/pocketbase upgrade --encryptionEnv=$PB_ENCRYPTION_KEY && \
    /pb/pocketbase serve --http=0.0.0.0:8080 --encryptionEnv=PB_ENCRYPTION_KEY