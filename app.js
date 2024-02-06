import express from 'express';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import session from 'express-session';
import flash from 'connect-flash';
// Import env variables
import dotenv from 'dotenv'; 
dotenv.config({ path: 'process.env' });

const app = express();

// Body-parser setup (Express now includes this functionality)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the public directory
app.use(express.static('public'));

app.use(session({
    secret: 'your_secret_key', // Replace with your secret key
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

// Middleware to make flash messages available to all views
app.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    next();
});
// Import routes
import routes from './routes/routes.js';
app.use('/', routes);

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });



const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
