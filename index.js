const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors({
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
}))
app.use(express.json())


// token verification 
const verifyJwt =(req, res , next) =>{
  const authorization = req.headers.authorization
  if( !authorization ){
    return res.send({ message: "No token found"})
  }
  const token = authorization.split(' ')[1];
  jwt.verify(token , process.env.ACCESS_TOKEN, (err, decoded) =>{
    if(err){
      return res.send({message : "Invalid token"})
    }
    req.decoded= decoded;
    next()
  })
} 

// verify Seller

 const verifySeller = async ( req ,res ,next)=>{
  const email = req.decoded.email
  const query = { email : email}
  const user = await userCollection.findOne(query)
  if(user?.role !== 'seller'){
    return res.send({message: "Forbidden access"})
  }
  next()
 }

// mongoDB

const uri =  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.osztyuf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
     
  const userCollection = client.db("gadgetShop").collection('users');
  const allProduct =client.db('gadgetShop').collection('products')

  const dbConnect =async ()=>{
    try{
      await  client.connect();
      console.log('DB connected')

      // insert Users
      app.post('/users', async( req, res )=>{
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.send(result)
      })

      // get user
      app.get('/user/:email' , async ( req, res )=>{
        const query = {email: req.params.email}
        const user = await userCollection.findOne(query)
        res.send(user)    
      })

      // Add Product
     app.post('/add-products',verifyJwt, verifySeller, async( req, res )=>{
        const product = req.body
        const result = await allProduct.insertOne(product)
        res.send(result)
     }) 

    //  all products
    app.get( '/all-products' , async( req, res )=>{
      const {title, sort, brand, category} = req.query
      const query = {}

      if(title){
        query.title ={ $regex:title , $options: 'i'}
      }
      if(category){
        query.category ={ $regex:category , $options: 'i'}
      }
      if(brand){
        query.brand = brand
      }

      const sortOptions = sort === 'asc' ? -1 : 1

      const products = await allProduct.find(query).sort({price: sortOptions}).toArray()

      const productInfo = await allProduct.find({}, { projection:{ category:1 , brand: 1}}).toArray();

      const totalProduct = await allProduct.countDocuments(query)

      const brands = [...new Set(productInfo.map((product)=> product.brand ))]
      const categories = [...new Set(productInfo.map((product)=> product.category ))]

      res.send({products, brands, categories, totalProduct})
    })


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