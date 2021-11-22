var express = require('express');
const User = require('../../db').User;
var router = express.Router();
const colorGenerator = require("../../helpers/backgroundGenerator");
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// Create user (SIGN UP)
router.post('/create', async (req, res) => {
    let body = req.body;
    // Check if an account is already using that email
    let accountSearch = await User.findOne({
        where: {
            email: body.email
        }
    })
    if (accountSearch !== null) {
        return res.json({
            status: "ERROR",
            message: "An account is already using that email"
        })
    }

    // If an account does not exist with that email, create an account
    let idCode = Math.floor((Math.random() * 99999) + 10000);
    idCode = Number(idCode.toString().substring(0, 5))

    let {username, email, password} = body
    password = await bcrypt.hashSync(password, 10)
    let userToCreate = {
        uuid: await uuidv4(),
        username,
        email,
        password,
        idCode,
        backgroundColor: await colorGenerator.generate()
    }
    let createdUser = await User.create(userToCreate);
    let token = jwt.sign( { uuid: createdUser.uuid }, process.env.JWT_SECRET, { expiresIn: 60*60*24 });

    if (!createdUser.username) {
        return res.json({
            status: "ERROR",
            message: "Failure to create user account, please try again later"
        })
    }

    res.json({
        status: "SUCCESS",
        sessionToken: token,
        user: createdUser
    })
})

// Retrieve user (LOGIN)
router.post('/login', async (req, res) => {
    let body = req.body;
    let { email, password } = body;
    let userSearch = await User.findOne({
        where: {
            email: email
        }
    })

    // If the email is not found
    if (userSearch === null) {
        return res.json({
            status: "ERROR",
            message: "Account not found with that email"
        })
    }

    // If a user is found, tap into the given user information
    const user = userSearch.dataValues;

    // Compare the encrypted user password to the given password
    bcrypt.compare(password, user.password, async (err, match) => {
        if (err) {
            return res.json({
                status: "ERROR",
                message: `${err.message}`
            })
        }

        if (match === false) {
            return res.json({
                status: "ERROR",
                message: "Password does not match the provided email"
            })
        }

        let token = jwt.sign( { uuid: user.uuid }, process.env.JWT_SECRET, { expiresIn: 60*60*24 });
        res.json({
            status: "SUCCESS",
            sessionToken: token,
            user
        })
    })
})

// Check the given token and see if the user has access to a quick load
router.post("/authenticate", async (req, res) => {
    let sessionToken = req.body.token;
    jwt.verify(sessionToken, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
            return res.json({
                status: "ERROR",
                message: "Valid user session not found with current token"
            })
        }

        if (decodedToken === undefined) {
            return res.json({
                status: "ERROR",
                message: "Valid user session not found with current token"
            })
        }

        let user = await User.findOne({ where: { uuid: decodedToken.uuid } })
        
        res.json({
            status: "SUCCESS",
            user
        })
    })
})

module.exports = router;