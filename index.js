const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.lhckmem.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const usersCollection = client.db("E-commerce-project").collection("users");

        const productsCollection = client.db("E-commerce-project").collection("products");

        //save user data ---------
        app.put('/users', async (req, res) => {
            const user = req.body
            const email = user.email
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        app.get('/products', async (req, res) => {
            const query = {}
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        });

        //load single product -------
        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productsCollection.findOne(query);
            res.send(product);
        });





    }
    finally {

    }
}

run().catch(err => console.log(err))


app.get('/', async (req, res) => {
    res.send('react job task server is running');
})

app.listen(port, () => console.log(`react job task running on ${port}`))