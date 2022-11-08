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

        app.post('/services', async(req,res) => {
            const result = await database.updateMany({},
                {$set : {"reviews":[]}},
                {upsert:false,
                multi:true})

                console.log(result);
        })

        app.patch('/addreview/:id', async(req,res) => {
            const id = req.params.id;
            const {name,message,rating,email,img} = req.body;
            const query= {_id: ObjectId(id)};
            const updateDoc = {author:name, email, message, img, rating, updated: new Date().getTime()}

            const result = await database.updateOne(query ,{
                $push: {reviews: updateDoc}
            },{upsert:false,
                multi:true})

            res.send({
                status: 'successfull',
                result: result
            })
            console.log(result);
        })


        //all the get mehods here
        app.get('/service3', async (req, res) => {
            const cursor = database.find({}).limit(3);
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

        //get methods ends here
    }
    finally {}
}

dbConnection()
    .catch(err => res.send({
        status: 'error',
        data: err
    }))












// client.connect(err => {
//     const collection = client.db("dencure").collection("services");
//     console.log('connected');
//     client.close();
// });














// const services = require('./service.json');


// app.get('/services', (req,res) => {
//     res.send(services)
// })





app.listen(process.env.PORT || 5000, () => {
    console.log(`server is listening on port:${process.env.PORT}`);
})