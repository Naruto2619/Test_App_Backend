import express from 'express';
import bodyParser from 'body-parser'; 
import cors from 'cors';
import dotenv from 'dotenv'; 
import session from 'express-session';

dotenv.config();

import wishlistRoutes from './routes/wishlist.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'https://siddharth27.myshopify.com', 
    credentials: true
}));
app.use(session({
    secret: 'super-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,        
      sameSite: 'lax' 
    }
}));
app.use(bodyParser.json());

// Routes
app.use('/wishlist', wishlistRoutes);
// app.use('/', (req, res) => {
//     res.send('Welcome to the Swym API Integration Server!');
// });

app.use('/', (req, res) => {
    res.send('Welcome to the Swym API Integration Server!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});