FROM node:12.18.1

WORKDIR /app

COPY ["package.json", "package-lock.json*", "tsconfig.json", "./"]

RUN npm install
RUN npm install -g ts-node

COPY . .

CMD [ "npm", "start" ]