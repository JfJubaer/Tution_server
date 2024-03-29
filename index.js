const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const stripe = require("stripe")('sk_test_51MbPCuFJhUO1VhGGxexvteISUJPR7MV7klUxhprR0MmtpaREq8gE2amUpj5hhb3VGqBOUnTkEW80jhkmDBYS99Yv00gZSQDhIt');

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j88am2v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// collections

const services = client.db("tution-point").collection("subs");
const reviews = client.db("tution-point").collection("reviews");
const cart = client.db("tution-point").collection("items");
const paymentCollection = client.db("tution-point").collection("payment");

async function run() {
  try {
    // Services are here
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = services.find(query);
      const totalServices = await cursor.toArray();
      res.send(totalServices);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await services.findOne(query);
      res.send(service);
    });
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await services.insertOne(service);
      res.send(result);
    });
    // All reviews are here
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviews.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/reviews/:title", async (req, res) => {
      query = {
        title: req.params.title,
      };
      const cursor = reviews.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviews.insertOne(review);
      res.send(result);
    });
    // My added reviews start here
    app.get("/myreviews/:email", async (req, res) => {
      let
        query = {
          email: req.params.email,
        };
      const cursor = reviews.find(query);
      const myReviews = await cursor.toArray();
      res.send(myReviews);
    });
    app.get("/myreview/:id", async (req, res) => {
      const id = req.params.id;
      const chosenReview = await reviews.findOne({ _id: ObjectId(id) });
      res.send(chosenReview);
    });
    app.patch("/reviews/:id", async (req, res) => {
      const { id } = req.params;
      const update = req.body.review;
      const result = await reviews.updateOne(
        { _id: ObjectId(id) },
        { $set: { review: update } }
      );
      res.send(result);
    });
    app.delete("/reviews/:id", async (req, res) => {
      const { id } = req.params;
      const result = await reviews.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });
    // carts section is here
    app.get("/cart", async (req, res) => {
      const result = await cart.find({}).toArray();
      res.send(result);
    })
    app.get("/cart/:user", async (req, res) => {
      const { user } = req.params;
      const query = { user: user };
      // console.log(query);
      const result = await cart.find(query).toArray();
      // console.log(result);
      res.send(result);
    })
    app.post("/cart", async (req, res) => {
      const item = req.body;
      const result = await cart.insertOne(item);
      res.send(result);
    })
    app.delete("/cart/:id", async (req, res) => {
      const { id } = req.params;
      const result = await cart.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    })
    // payment section
    app.post('/payment', async (req, res) => {
      const total = req.body.total;
      const price = total * 1;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        currency: 'usd',
        amount: amount,
        "payment_method_types": [
          "card"
        ]
      });
      res.send({ clientSecret: paymentIntent.client_secret })
    })
    app.post('/payment-done', async (req, res) => {
      const payment = req.body;
      const result = await paymentCollection.insertOne(payment);
      res.send(result);
    })
    // This section ends here
  } finally {
  }
}
run();
app.get('/', (req, res) => {
  res.send('Server is running at full speed')
})
app.listen(port, () => {
  console.log('Server is running at ', port);
})