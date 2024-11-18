const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors())
app.use(express.json())

// mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.osztyuf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  const dbConnect =async ()=>{
    try{
      await  client.connect();
      console.log('DB connected')
    }
    catch(error){
        console.log(error.name , error.message)
    }
  }

  dbConnect()

// api

app.get("/", async (req, res) =>{
    res.send('server is running')
})


// jwt
 
 app.post('/authentication', async ( req , res )=>{
  const userEmail = req.body;
  const token = jwt.sign(userEmail , process.env.ACCESS_TOKEN, 
    { expiresIn: '10d'})
    res.send({token})
 })

app.listen(port , ()=>{
    console.log(`server is running on the port,${port}`)
})