const router = require('express').Router();
const { ObjectId } = require('mongodb');

function getUsersRouter(collectionConnectUsers) {
    router.post('/', async (req, res) => {
        const { insertedId: userID } = await collectionConnectUsers.insertOne(req.body);

        const user = await collectionConnectUsers.findOne({ _id: userID });
        res.status(200).json(user);
    });

    router.post('/many', async (req, res) => {
        const { insertedIds } = await collectionConnectUsers
            .insertMany(req.body);
        const query = {
            _id: {
                $in: Object.values(insertedIds)
            }
        };

        const inserted = await collectionConnectUsers.find(query).toArray();

        res.status(200).json(inserted);
    });

    router.get('/:id', async (req, res) => {
        const userId = req.params.id;
        const isObjId = ObjectId.isValid(userId);

        if (!isObjId) return res
            .status(400)
            .json({ error: 'Invalid ObjectId for :userId', derails: `Actual value: "${userId}"` });

        const obj = new ObjectId(userId);
        const user = await collectionConnectUsers.findOne({ _id: obj });

        if (!user) {
            res.json(`user with id: "${userId}" not found`);
            return;
        } else {

            res.json(user);
        }
    });

    router.get('/', (req, res, next) => {
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

    router.get('/', async (req, res) => {
        const { limit = 5, skip = 0 } = req.query;
        const users = await collectionConnectUsers.find({})
            .limit(+limit).skip(+skip).toArray();
        res.json(users);
    });

    router.put('/:id', async (req, res) => {
        const userId = req.params.id;
        const isObjId = ObjectId.isValid(userId);

        if (!isObjId) {
            return res.status(400).json({ error: `"${userId}": invalid user id` });
        };

        const obj = new ObjectId(userId);
        const updateUser = req.body;

        const { modifiedCount: modified, matchedCount: matched } = await collectionConnectUsers.updateOne(
            { _id: obj }, { $set: updateUser });

        if (matched === 0) {
            res.json(`user with id: "${userId}" not found`);
            return;
        }
        if (modified === 0) {
            res.json(`user with id: "${userId}" has been modified before`);
            return;
        }

        const user = await collectionConnectUsers.findOne({_id: obj});

        res.status(200).json(user);
    });

    router.delete('/:id', async (req, res) => {
        const userId = req.params.id;
        const isObjId = ObjectId.isValid(userId);

        if (!isObjId) {
            res.status(400).json({ error: `"${userId}": invalid user id` });
            return;
        }

        const obj = new ObjectId(userId);
        const { deletedCount: deleted } = await collectionConnectUsers.
            deleteOne({ _id: obj });

        if (deleted === 0) {
            res.json(`users with id: "${userId}" not found`);
            return;
        }

        res.status(204).end();
    });


    return router;
}

module.exports = getUsersRouter;
