const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const jwt = require('jsonwebtoken');

const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.lhckmem.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
};


async function run() {
    try {
        const usersCollection = client.db("E-commerce-project").collection("users");

        const productsCollection = client.db("E-commerce-project").collection("products");
        const orderCollection = client.db("E-commerce-project").collection("orders");


         //create jwt---------
         app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '10d' });
                return res.send({ accessToken: token })
            }

            res.status(403).send({ accessToken: 'no token available' })

        });


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

        // get admin user-----
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        });

        // get customers list-----
        app.get('/users', verifyJWT, async (req, res) => {
            const query = {};
            const customers = await usersCollection.find(query).toArray();
            res.send(customers);
        });

        // get all products-------
        app.get('/products', async (req, res) => {
            const query = {}
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        });

        //admin see all products---
        app.get('/adminAllProduct', verifyJWT, async (req, res) => {
            const query = {}
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        });

        //add new products--------
        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        });

        //load single product -------
        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productsCollection.findOne(query);
            res.send(product);
        });

        //booking product -------
        app.get('/addToBooking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productsCollection.findOne(query);
            res.send(product);
        });

        // booking product save-------
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        //get order customer and admin -------
        app.get('/AllOrders/:email', async (req, res) => {
            const email = req.params.email;
            const query = {}
            const orders = await orderCollection.find(query).toArray();
            const users = await usersCollection.findOne({ email: email });

            if (users?.role === 'admin') {
                res.send(orders)
            }
            else {
                const order = orders?.filter(order => order.email === email)
                res.send(order);
            }
        });

        app.get('/adminAllOrder', verifyJWT, async (req, res) => {
            const query = {}
            const result = await orderCollection.find(query).toArray();
            res.send(result);
        });


        // booking product delete save-------
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            res.send(result);
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