const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cet8s8u.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



const dbConnection = async () => {
    try {
        const database = client.db('dencure').collection('services');
        const reviewDatabase = client.db('dencure').collection('reviews');

        //add reviews here
        app.post('/addreview/:id', async(req,res) => {
            const id = req.params.id;
            const {name,message,rating,email,img, brief} = req.body;
            const updateDoc = {
                service: id,
                message, email, author: name, heading: brief,
                review: rating, avatar: img,
                updateat: new Date().getTime()
            };
            const result = await reviewDatabase.insertOne(updateDoc);
            res.send({
                status: 'successfull',
                result: result
            })
            console.log(result);
        })

        //addservicess here
        app.post('/addservice', async(req,res) => {
            const {title,price, ratings,photo,desc} = req.body;
            const addService = {
                title,price, ratings,photo,desc,
                updatedAt: `${new Date().getTime()}`
            };
            const result = await database.insertOne(addService);
            res.send({
                status: 'successfull',
                result: result
            })
            console.log(result);
        })


        //all the get mehods here
        app.get('/reviews', async(req,res) => {
            let query = {};
            const email = req.query.email;
            if(email){
                query = {email: email}
            }
            const cursor = reviewDatabase.find(query);
            const reviews = await cursor.toArray();
            res.send({
                status: 'success',
                data: reviews
            })
        })

        app.get('/service3', async (req, res) => {
            const cursor = database.find({}).sort({updatedAt:-1}).limit(3);
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
            const query = {_id: ObjectId(id)};
            const data = await database.findOne(query);
            res.send(data);
        })

        app.get('/review/:id', async (req,res) => {
            const id = req.params.id;
            const query = {service: id};
            const cursor = reviewDatabase.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        //get data to the update review page to set as a default value.
        app.get('/getreview/:id', async (req,res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewDatabase.findOne(query);
            console.log(id,result);
            res.send(result)
        })

        //delete review from the myreview section
        app.delete(`/delreview/:id`, async (req,res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewDatabase.deleteOne(query);
            res.send(result);
        })



    }
    finally {}
}

dbConnection()
    .catch(err => res.send({
        status: 'error',
        data: err
    }))
















// const services = require('./service.json');


// app.get('/services', (req,res) => {
//     res.send(services)
// })





app.listen(process.env.PORT || 5000, () => {
    console.log(`server is listening on port:${process.env.PORT}`);
})