const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j88am2v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



const services = client.db("tution-point").collection("subs");
const reviews = client.db("tution-point").collection("reviews");


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
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviews.insertOne(review);
      res.send(result);
    });
    // My added reviews start here
    app.get("/reviews", async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "unauthorized access" });
      }
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviews.find(query);
      const myReviews = await cursor.toArray();
      res.send(myReviews);
    });

    app.get("/reviews/:id", async (req, res) => {
      const { id } = req.params;
      const chosenReview = await reviews.findOne({ _id: ObjectId(id) });
      res.send(chosenReview);
    });

    app.patch("/reviews/:id", async (req, res) => {
      const { id } = req.params;
      const result = await reviews.updateOne(
        { _id: ObjectId(id) },
        { $set: req.body }
      );
      res.send(result);
    });
    app.delete("/reviews/:id", async (req, res) => {
      const { id } = req.params;
      const result = await reviews.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });
    // User added newService to the homepage
    app.get("/services", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = services.find(query);
      const myNewAddedService = await cursor.toArray();
      res.send(myNewAddedService);
    });
    app.post("/services", async (req, res) => {
      const newService = req.body;
      const result = await services.insertOne(newService);

      res.send(result);
    });
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