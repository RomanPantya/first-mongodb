const router = require('express').Router();
const { ObjectId } = require('mongodb');

function getCarRouter(collectionConnectCars) {
    router.post('/', async (req, res) => {
        const { userId } = req.query;
        const isObjId = ObjectId.isValid(userId);

        if (!isObjId) {
            return res.status(400)
                .json({ error: `"${userId}": invalid user id` });
        }

        const createCar = req.body;
        createCar.userId = userId;

        await collectionConnectCars.insertOne(createCar);
        const car = await collectionConnectCars.findOne({ userId });

        res.status(200).json(car);
    });

    router.get('/:carId', async (req, res) => {
        const carId = req.params.carId;
        const { userId } = req.query;
        const isObjUserId = ObjectId.isValid(userId);
        const isObjCarId = ObjectId.isValid(carId);
    
        if (!isObjUserId) {
            return res.status(400)
                .json({ error: `"${userId}": invalid user id` });
        }
    
        if (!isObjCarId) {
            return res.status(400)
                .json({ error: `"${carId}": invalid car id` });
        }
        const objCarId = new ObjectId(carId);
        const car = await collectionConnectCars.findOne({ _id: objCarId });
    
        if (!car || car.userId !== userId) {
            return res.status(400)
                .json({ error: "no data or you do not have access" })
        }
    
        res.json(car);
    });

    router.put('/:carId', async (req, res) => {
        const { carId } = req.params;
        const { userId } = req.query;
        const isObjUserId = ObjectId.isValid(userId);
        const isObjCarId = ObjectId.isValid(carId);

        if (!isObjUserId) {
            return res.status(400)
                .json({ error: `"${userId}": invalid user id` });
        }

        if (!isObjCarId) {
            return res.status(400)
                .json({ error: `"${carId}": invalid car id` });
        }

        const updateCar = req.body;
        const objCarId = new ObjectId(carId);

        const car = await collectionConnectCars.findOne({ _id: objCarId });

        if (!car || car.userId !== userId) {
            return res.status(400)
                .json({ error: "no data or you do not have access" })
        }

        await collectionConnectCars.updateOne(
            { _id: objCarId }, { $set: updateCar }
        );

        const carUp = await collectionConnectCars.findOne({ _id: objCarId });

        res.json(carUp);
    });

    router.delete('/:carId', async (req, res) => {
        const { carId } = req.params;
        const { userId } = req.query;
        const isObjUserId = ObjectId.isValid(userId);
        const isObjCarId = ObjectId.isValid(carId);

        if (!isObjUserId) {
            return res.status(400).json({ error: `"${userId}": invalid user id` });
        }
        if (!isObjCarId) {
            return res.status(400).json({ error: `"${carId}": invalid car id` });
        }

        const objCarId = new ObjectId(carId);
        const car = await collectionConnectCars.findOne({ _id: objCarId });

        if (!car || car.userId !== userId) {
            return res.status(400)
                .json({ error: "no data or you do not have access" });
        }

        await collectionConnectCars.deleteOne({ _id: objCarId });

        res.status(204).end();
    });

    return router;
}


module.exports = getCarRouter;
