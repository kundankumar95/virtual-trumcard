import dotenv from 'dotenv';
dotenv.config();
const port = 4000;
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import path from 'path';
import Stripe from 'stripe';
import axios from 'axios';
import { uploadRouter } from './uploading.js';
import { createRouteHandler } from 'uploadthing/express';


// const stripe = new Stripe('sk_test_51Q8QNCLN3ffFuuHqx37c88SNzKc1X1kaSsOSxNqcr8OpDoVn8n2P40WRTczy4dnAyFQ8vh0cuHYmcfyhSsZVuqbV00cNAiEnge');


const app = express();
const router = express.Router();
// require('dotenv').config();


app.use(cors());
app.use(bodyParser.json());
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    
  }),
);
const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Failed to connect to MongoDB", err.message));


const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Users = mongoose.model('User', UserSchema);

app.get("/", (req, res) => {
  res.send("Express App is Running Now");
});

app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // console.log('Request Body:', req.body); 

    if (!username || !email || !password) {
      console.log('Missing fields:', { username, email, password });
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    let user = await Users.findOne({ email });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new Users({
      name: username,
      email,
      password: hashedPassword
    });

    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, 'secret_ecom', { expiresIn: '1h' });

    res.json({ success: true, token });
  } catch (error) {
    console.error('Signup Error:', error.message); 
    res.status(500).send('Server error');
  }
});



app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Destructure the body

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: "Wrong Email Id" });
    }

    const passCompare = await bcrypt.compare(password, user.password);
    if (!passCompare) {
      return res.status(400).json({ success: false, error: "Wrong Password" });
    }

    const data = { user: { id: user.id } };
    const token = jwt.sign(data, 'secret_ecom', { expiresIn: '1h' });

    res.json({ success: true, token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});


const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Check for file in request
    console.log("hii");
    console.log(req);
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Get the token from environment variables
     const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN;
    
    // Send file data to UploadThing API
    const response = await axios.post('https://api.uploadthing.com/upload', {
      file: req.file.buffer,
    }, {
      headers: {
        'Authorization': `Bearer ${UPLOADTHING_TOKEN}`,
        'Content-Type': req.file.mimetype,
      },
    });

    if (response.data.success) {
      res.json({
        success: true,
        image_url: response.data.url,
      });
    } else {
      res.status(500).json({ success: false, message: 'File upload failed' });
    }
  } catch (err) {
    console.error('Upload Error:', err.response ? err.response.data : err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});


const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, required: true },
  price: { type: Number, required: true },
  AGR: { type: Number, required: true },
  APPS: { type: Number, required: true },
  GA_TW_SV: { type: String, required: true },
  value: { type: Number, required: true },
});


const Product = mongoose.model('Product', ProductSchema);

// Add Product Endpoint
app.post('/addproduct', async (req, res) => {
  try {
    let products = await Product.find({});
    let id = products.length > 0 ? products.slice(-1)[0].id + 1 : 1;

    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      rating: req.body.rating,
      price: req.body.price,
      AGR: req.body.AGR,
      APPS: req.body.APPS,
      GA_TW_SV: req.body.GA_TW_SV,
      value: req.body.value,
    });
    await product.save();
    res.json({ success: true, product });

  } catch (err) {
    console.error('Add Product Error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
}); 

// Remove Product Endpoint
app.post('/removeproduct', async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({ success: true, name: req.body.name });
  } catch (err) {
    console.error('Remove Product Error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get All Products Endpoint
app.get('/allproducts', async (req, res) => {
  console.log('Received request for /allproducts'); 
  try {
    let products = await Product.find({});
    // console.log('Products retrieved:', products); 
    res.send(products);
  } catch (err) {
    console.error('Get All Products Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

//creating endpoint for newCards data
app.get('/newCards', async (req, res) => {
  try {
    const { search } = req.query; 
    let products;

    if (search) {
      console.log("Search query:", search); 
      const regex = new RegExp(search, 'i'); 
      products = await Product.find({ name: regex });
      console.log("Matching products:", products); 
    } else {
      products = await Product.find().sort({ createdAt: -1 }).limit(20);
      console.log("Latest products fetched:", products); 
    }

    if (products.length === 0) {
      console.log("No products found.");
    }

    res.json(products);
  } catch (error) {
    console.error("Error fetching cards:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});




// Checkout API
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { amount, email } = req.body;

        if (!amount || !email) {
            return res.status(400).json({ error: 'Missing amount or email' });
        }

        const amountInCents = amount * 100; 
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: 'Your Product Name',
                    },
                    unit_amount: amountInCents, 
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session.' });
    }
});
app.use('/api', router);

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});