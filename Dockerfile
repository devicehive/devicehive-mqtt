FROM node:10.1.0-alpine

MAINTAINER devicehive

LABEL org.label-schema.url="https://devicehive.com" \
      org.label-schema.vendor="DeviceHive" \
      org.label-schema.vcs-url="https://github.com/devicehive/devicehive-mqtt" \
      org.label-schema.name="devicehive-mqtt" \
      org.label-schema.version="development"

ENV WORK_DIR=/usr/src/app/
RUN mkdir -p ${WORK_DIR} \
    && cd ${WORK_DIR}

WORKDIR ${WORK_DIR}

COPY . ${WORK_DIR}

RUN apk add --no-cache --virtual .gyp \
        python make  g++ \
  && npm install \
  && apk del .gyp \
  && npm install pm2 -g \
  && npm cache clean --force

EXPOSE 1883
CMD ["pm2-docker", "src/broker.js"]
