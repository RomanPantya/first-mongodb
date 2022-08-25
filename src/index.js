const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const morgan = require('morgan');

const client = new MongoClient('mongodb://localhost:27017');
const dbName = 'first-mongodb';
const app = express();

app.use(express.json());
app.use(morgan('dev'));


async function main() {
    const connection = await client.connect();
    const dbConnect = connection.db(dbName);
    const collectionConnect = dbConnect.collection('users');

    app.post('/users', async (req, res) => {
        await collectionConnect.insertOne(req.body);
        res.status(200).end("ok");
    });

    app.post('/users/many', async (req, res) => {
        await collectionConnect.insertMany(req.body);
        res.status(200).end('ok');
    });


    app.get('/users/:id', async (req, res) => {
        const userId = req.params.id;
        const isObjId = ObjectId.isValid(userId);

        if (!isObjId) return res
            .status(400)
            .json({ error: 'Invalid ObjectId for :userId', derails: `Actual value: "${userId}"` });

        const obj = new ObjectId(userId);
        const user = await collectionConnect.findOne({ _id: obj });

        if (!user) {
            res.json(`user with id: "${userId}" not found`);
            return;
        } else {

            res.json(user);
        }
    });

    app.get('/users', (req, res, next) => {
        const { limit = 5, skip = 0 } = req.query;

        if ((limit < 1 || limit > 100) || (skip < 0 || skip > 10_000)) {
            res.json({
                "min limit": 1,
                "max limit": 100,
                "min skip": 0,
                "max skip": 10_000
            });

            return;
        }

        next();
    });

    app.get('/users', async (req, res) => {
        const { limit = 5, skip = 0 } = req.query;
        const users = await collectionConnect.find({})
            .limit(+limit).skip(+skip).toArray();
        res.json(users);
    });

    app.put('/users/:id', async (req, res) => {
        const userId = req.params.id;
        const isObjId = ObjectId.isValid(userId);

        if (!isObjId) {
            return res.status(400).json({ error: `"${userId}": invalid user id` });
        };

        const obj = new ObjectId(userId);
        const updateUser = req.body;

        const { modifiedCount: modified, matchedCount: matched } = await collectionConnect.updateOne(
            { _id: obj }, { $set: updateUser });

        if (matched === 0) {
            res.json(`user with id: "${userId}" not found`);
            return;
        }
        if (modified === 0) {
            res.json(`user with id: "${userId}" has been modified before`);
            return;
        }

        res.status(200).end('ok');
    });

    app.delete('/users/:id', async (req, res) => {
        const userId = req.params.id;
        const isObjId = ObjectId.isValid(userId);

        if (!isObjId) {
            res.status(400).json({ error: `"${userId}": invalid user id` });
            return;
        }

        const obj = new ObjectId(userId);
        const { deletedCount: deleted } = await collectionConnect.
            deleteOne({ _id: obj });

        if (deleted === 0) {
            res.json(`users with id: "${userId}" not found`);
            return;
        }

        res.status(204).end();
    });




    app.listen(4000, () => {
        console.log('After listen db is', dbConnect);
        console.log('http://localhost:4000');
    });
};

main();
