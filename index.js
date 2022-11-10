const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jsonToken = require('jsonwebtoken');
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cet8s8u.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//setup the middlewares for jsonweb authorization
const verification = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'You have no permission to access!!!' });
    }
    const token = authHeader.split(' ')[1];
    console.log(token);
    jsonToken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(401).send({ messsage: 'Unauthorized token' })
        }
        req.decoded = decoded;
        next();
    })
};



const dbConnection = async () => {
    try {
        const database = client.db('dencure').collection('services');
        const reviewDatabase = client.db('dencure').collection('reviews');

        //getting the jwt token
        app.post('/tokencollection', async (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jsonToken.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        })

        //add reviews here
        app.post('/addreview/:id', async (req, res) => {
            const id = req.params.id;
            const { name, message, rating, email, img, brief } = req.body;
            const updateDoc = {
                service: id,
                message, email, author: name, heading: brief,
                review: rating, avatar: img,
                updateat: `${new Date().getTime()}`
            };
            const result = await reviewDatabase.insertOne(updateDoc);
            res.send({
                status: 'successfull',
                result: result
            })
            console.log(result);
        })

        //addservicess here
        app.post('/addservice', async (req, res) => {
            const { title, price, ratings, photo, desc } = req.body;
            const addService = {
                title, price, ratings, photo, desc,
                updatedAt: `${new Date().getTime()}`
            };
            const result = await database.insertOne(addService);
            res.send({
                status: 'successfull',
                result: result
            })
            console.log(result);
        })


        //implementing jasonwebtoken middleware here
        app.get('/reviews',verification, async (req, res) => {
            let query = {};
            const email = req.query.email;
            const decoded = req.decoded;
            if(decoded.email !== email){
               return res.status(403).send({message: 'Unauthorized Access'})
            }

            if(email) {query = {email}}

            const cursor = reviewDatabase.find(query);
            const reviews = await cursor.toArray();
            res.send({
                status: 'success',
                data: reviews
            })
        })
        //ending jsonwebtoken part here

        app.get('/service3', async (req, res) => {
            const cursor = database.find({}).sort({ updatedAt: -1 }).limit(3);
            const data = await cursor.toArray();
            res.send({
                status: 'success',
                data: data
            })
        })

        app.get('/services', async (req, res) => {
            const cursor = database.find({});
            const data = await cursor.toArray();
            res.send(data)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const data = await database.findOne(query);
            res.send(data);
        })

        app.get('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { service: id };
            const cursor = reviewDatabase.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        //get data to the update review page to set as a default value.
        app.get('/getreview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewDatabase.findOne(query);
            res.send(result)
        })

        //delete review from the myreview section
        app.delete(`/delreview/:id`, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewDatabase.deleteOne(query);
            res.send(result);
        })

        app.patch('/updatereview/:id', async (req, res) => {
            const { author, review, message, heading, avatar } = req.body;
            const id = req.params.id;
            const query = { _id: ObjectId(id) }

            const dataToUpdate = {
                $set: {
                    author, review, message, heading, avatar,
                    updateat: `${new Date().getTime()}`
                }
            }
            const result = await reviewDatabase.updateOne(query, dataToUpdate);
            res.send(result)
        })



    }
    finally { }
}

dbConnection()
    .catch(err => res.send({
        status: 'error',
        data: err
    }))


app.listen(process.env.PORT || 5000, () => {
    console.log(`server is listening on port:${process.env.PORT}`);
})