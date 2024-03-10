const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../Models/TourModel');

dotenv.config({ path: './config.env' });

const DBSTRING = process.env.DATABASE_CONNECTION_STRING;

mongoose
  .connect(DBSTRING, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log('connection is success!');
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data imported!');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

const deleteAllData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data deleted!');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteAllData();
}
