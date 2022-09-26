const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


//@route    POST api/users
//@desc     sign up
//@access   Public
router.post('/', [
    check('name', 'Name should be string with at least 3 character').notEmpty().trim(),
    check('email', 'Email is not valid').isEmail().normalizeEmail(),
    check('password', 'The password must be 5+ chars long and contain a number')
        .not()
        .isIn(['123', 'password', 'god',])
        .withMessage('Do not use a common word as the password')
        .matches(/\d/)
], async (req, res) => {
    console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body
    try {
        // check if user exist or not
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json([{ msg: "User already exist" }]);
        }

        //grave users gravatar
        const avatar = gravatar.url(req.body.email, {
            //size
            s: '200',
            //rating
            r: 'pg',
            //default
            d: 'mm'
        });

        //creating instance
        user = new User({...req.body,avatar})

        //encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        //return jwt
        const payload = {
            user: {
                id: user.id 
            }
        }
        jwt.sign(
            payload,
           process.env.jwtToken,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                return res.json({ token });
            }
        );
        //save user
        await user.save();

    } catch (error) {
        console.log(`Error in Sign Up : ${error.message}`);
        return res.status(500).json({ msg: 'Server Error' });
    }

});


module.exports = router;