FROM node:8.1.4-alpine
ENV WORK_DIR=/usr/src/app/
RUN mkdir -p ${WORK_DIR} \
    && cd ${WORK_DIR}

WORKDIR ${WORK_DIR}

RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++

COPY . ${WORK_DIR}

RUN npm install \
    && apk del .gyp

EXPOSE 1883
CMD ["node", "src/broker.js"]