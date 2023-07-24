const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
dotenv.config();
const connectDB = require('./backend/config/db');
connectDB()

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Referrer-Policy', 'no-referrer-when-downgrade')
    next();
});
app.use('/', require('./backend/routes/userRoutes'))
app.listen(5000, () => console.log(`Server started on port 5000`));