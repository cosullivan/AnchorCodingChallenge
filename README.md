# AnchorCodingChallenge

Run build and run via Docker, run the following from within the ```src``` folder.

```
docker-compose build && docker-compose up
```

This will start the monitor running and you will able to hit the following API running on localhost.

```
http://localhost:8080/prices
```

If you are not using Docker you should be able to build and run with the following;

```
npm install 
npm install -g ts-node
npm start
```