import express from 'express';
import bodyParser from 'body-parser'; 
import cors from 'cors';
import dotenv from 'dotenv'; 
import session from 'express-session';

dotenv.config();

import wishlistRoutes from './routes/wishlist.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(cors({
    origin: ['https://siddharth27.myshopify.com', 'https://checkout.shopify.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    maxAge: 86400 // Cache preflight requests for 24 hours
}));

app.use(session({
    secret: 'super-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',  // Secure in production
      sameSite: 'none'  // Required for cross-site cookies in production
    }
}));
app.use(bodyParser.json());

// Routes
app.use('/wishlist', wishlistRoutes);

app.use('/', (req, res) => {
    res.send('Welcome to the Swym API Integration Server!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});