const express = require('express');
const app = express();
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
require("dotenv").config();
const cors = require('cors');
const PORT = process.env.PORT || 5000;
//connect db
connectDB();

app.use(cors());

app.get('/',(req,res)=>{
    res.send('API running...')
});


app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));