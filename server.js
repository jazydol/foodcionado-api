const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('uncaught Exception!!! shutting down....');
  console.log(err);
  process.exit(1);
});


const DBSTRING = process.env.DATABASE_CONNECTION_STRING;

mongoose
  .connect(DBSTRING, {
    // useNewUrlParser: true, TO REMOVE WARNING
    // useUnifiedTopology: true
  })
  .then((con) => {
    console.log('connection is success!');
  });

if (process.env.NODE_ENV === 'development') {
  //console.log(process.env);
}

// start server
const server = app.listen(process.env.PORT, () => {
  console.log(`app is runing on port ${process.env.PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log('unhandled Rejection!!! shutting down....');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
