FROM node:8.9.3-alpine
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
