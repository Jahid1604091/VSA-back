const express = require('express');
const router = express.Router();


// GET api/users
// test route to get all users
// public
router.get('/',(req,res)=>{
    res.send('User')
});

module.exports = router;