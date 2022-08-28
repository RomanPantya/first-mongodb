const { json } = require('express');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const morgan = require('morgan');

const carsRouter = require('./routes/cars');
const usersRouter = require('./routes/users')

const client = new MongoClient('mongodb://localhost:27017');
const dbName = 'first-mongodb';
const app = express();

app.use(express.json());
app.use(morgan('dev'));


async function main() {
    const connection = await client.connect();
    const dbConnect = connection.db(dbName);
    const collectionConnectUsers = dbConnect.collection('users');
    const collectionConnectCars = dbConnect.collection('cars');

    app.use('/cars', carsRouter(collectionConnectCars));

    app.use('/users', usersRouter(collectionConnectUsers));



    app.listen(4000, () => {
        console.log('After listen db is', dbConnect);
        console.log('http://localhost:4000');
    });
};

main();
