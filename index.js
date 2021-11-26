const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

//mildleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server is working perfectly now");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.whpzl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("paperfly");
    const productcollenction = database.collection("services");
    const bookingCollection = database.collection("booking");
    //GET API
    app.get("/services", async (req, res) => {
      const cursor = productcollenction.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    // POST API (Add a order)
    app.post("/booking", async (req, res) => {
      const doc = req.body;
      const query = {
        bookingId: doc.bookingId,
      };
      const search = await bookingCollection.findOne(query);
      let result = { acknowledged: false };
      if (search === null) {
        result = await bookingCollection.insertOne(doc);
      } else {
        result = { acknowledged: false };
      }
      res.json(result);
    });

    // GET ALL (Send all order data)
    app.get("/booking", async (req, res) => {
      const cursor = bookingCollection.find({});
      const result = await cursor.toArray();

      res.json(result);
    });
    // GET API (Search by email send all matching data)
    app.get("/booking/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const cursor = await bookingCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });

    // DELETE API (Delete a order data)
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: ObjectId(id),
      };
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    });
    // DELETE API (Delete all order by email)
    app.delete("/allbooking/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        userEmail: email,
      };
      const result = await bookingCollection.deleteMany(query);
      res.json(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("server is running on port", port);
});
