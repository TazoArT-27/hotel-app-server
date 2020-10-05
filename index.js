
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config()
//console.log(process.env.DB_PASS)


const port = 5000

const serviceAccount = require("./configs/hotel-app-a6307-firebase-adminsdk-zmlxl-b9dc22e0a2.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIRE_DB
  });

const app = express();
app.use(cors());
app.use(bodyParser.json());



const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qjf3c.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  //console.log("db connection success")

  app.post("/addBooking", (req, res) => {
      const newBooking = req.body;
      bookings.insertOne(newBooking)
      .then(result => {
          //console.log(result)
          res.send(result.insertedCount > 0);
        })
        console.log(newBooking);
  })

  app.get("/bookings", (req, res) => {
      //console.log(req.query.email);
      //console.log(req.headers.authorization);
      const bearer = req.headers.authorization;
      if(bearer && bearer.startsWith("Bearer ")){
          const idToken = bearer.split(" ")[1];
          console.log({idToken});

          admin.auth().verifyIdToken(idToken)
            .then(function(decodedToken) {
            let tokenEmail = decodedToken.email;
            if (tokenEmail == req.query.email){
                bookings.find({email: req.query.email})
                .toArray((err, documents) => {
                    res.status(200).send(documents)
                })
            }
            else {
                res.status(401).send('unauthorized access');
            }
            //console.log(uid)
            }).catch(function(error) {
                res.status(401).send('unauthorized access');
            });
      }
      else{
          res.status(401).send('unauthorized access');
      }


     
        

   
  })

});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})