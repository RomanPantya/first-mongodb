const router = require('express').Router();
const { ObjectId } = require('mongodb');

function getCarRouter(collectionConnectCars) {
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

        res.end('ok');
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

        res.status(204).end('ok');
    });

    router.post('/', async (req, res) => {
        const { userId } = req.query;
        const isObjId = ObjectId.isValid(userId);

        if (!isObjId) {
            return res.status(400)
                .json({ error: `"${userId}": invalid user id` });
        }

        const createCar = req.body;
        createCar.userId = userId;
        const idUser = new ObjectId(userId);

        await collectionConnectCars.insertOne(createCar);

        res.status(200).end('ok');
    });

    return router;
}






module.exports = getCarRouter;