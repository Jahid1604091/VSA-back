
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const auth = require('../../middleware/auth');

//@route    GET api/auth
//@desc     TEST
//@access   Protected

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
});

//@route    POST api/auth
//@desc     sign in
//@access   Public
router.post('/', [
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password is required').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
        //user found
        const user = await User.findOne({ email });
        //user not found
        if (!user) {
            //to keep matching with express validation format
            return res.status(400).json([{ msg: "Invalid credentials" }]);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        //password not matched
        if (!isMatch) {
            return res.status(400).json([{ msg: "Invalid credentials" }]);
        }

        //user found and pass match
        //return jwt
        const payload = {
            user: {
                id: user.id //no need to use _id in mongoose
            }
        }
        jwt.sign(
            payload,
            process.env.jwtToken,
            { expiresIn: 36000 },
            (err, token) => {
                if (err) throw err;
                return res.json({ token });
            }
        );


    } catch (error) {
        console.log(`Error in Sign In : ${error.message}`);
        return res.status(500).send('Server Error');
    }


});


module.exports = router;