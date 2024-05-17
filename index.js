const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
let cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())
require('dotenv').config()

app.get('/', (req,res)=>{
    res.send('server working')
})



// 


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gumuqu0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// token verify middleware
const verifyToken = async(req,res, next)=>{
  const token = req.cookies?.token;
  // console.log('value', token)
  if(!token){
    return res.status(401).send({message: 'not authorized'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded)=>{
    if(error){
      return res.status(401).send({message: 'unauthorized'})
    }
  console.log('decodeddddd',decoded)
  req.user = decoded;
  next()
  })
}




async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const database = client.db("car_doctor").collection("services")
    const bookingData = client.db("car_doctor").collection("bookings")


    // jwt related api
    app.post('/jwt', async(req,res)=>{
      const userEmail = req.body;
      const token = jwt.sign(userEmail, process.env.ACCESS_TOKEN_SECRET , {expiresIn: '1h'})
      res
      .cookie('token', token, {
        httpOnly: true,
        secure:false
      })
      .send({success: true})
    })

    
    

    // service related api
    app.get('/services', async(req,res)=>{
        const cursor = database.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get('/services/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await database.findOne(query)
      res.send(result)
    })

    // bookings
    app.get('/booking', verifyToken, async(req,res)=>{
      // console.log(req.query.email)
      console.log(req.cookies.token)
      // if(req.query.email !== req.user.email){
      //   return res.status(401).send('unauthorized Access')
      // }
      let query ={}
      if(req.query?.email){
        query = {email : req.query.email}
      }
      const cursor = bookingData.find(query)
      const result = await cursor.toArray(cursor)
      res.send(result)
    })

    app.get('/booking/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await bookingData.findOne(query);
      res.send(result)
    })

    app.post('/booking', async(req, res)=>{
      const bookedData = req.body
      const result = await bookingData.insertOne(bookedData)
      res.send(result)
    })

    app.patch('/booking/:id', async(req,res)=>{
      const updatedBooking = req.body;
      const id = req.params.id
      const filter = {_id : new ObjectId(id)}
      const option ={ upsert : true}
      const updateDoc = {
        $set: {
          state : updatedBooking.status
        }
      }
      const result = await bookingData.updateOne(filter, updateDoc, option)
      res.send(result)
    })

    app.delete('/booking/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bookingData.deleteOne(query)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, ()=>{
    console.log(`server is working on port ${port}`)
})