const express = require('express');
const app = express();
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
require("dotenv").config();
const cors = require('cors');
const PORT = process.env.PORT || 5000;
//connect db
connectDB();

app.use(express.json());
app.use(cors());
app.get('/',(req,res)=>{
    res.send('API running...')
});


app.use('/api/users',require('./routes/api/users'));
app.use('/api/auth',require('./routes/api/auth'));
app.use('/api/posts',require('./routes/api/posts'));

app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));