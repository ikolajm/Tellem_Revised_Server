const Request = require("../../db").FriendRequest;
const User = require("../../db").User;
const Friend = require("../../db").Friend;
const bcrypt = require('bcryptjs');
const { Op } = require("sequelize");

const router = require("express").Router();

router.put('/update/:uuid', async (req, res) => {
    const body = req.body;

    const {username, email, backgroundColor, idCode} = body;
    let incomingObj = {
        username,
        email,
        backgroundColor,
        idCode
    }

    User.update(
        incomingObj,
        {
            where: { uuid: req.params.uuid },
            returning: true,
            plain: true
        }
    )
        .then(user => {
            res.json({
                status: "SUCCESS",
                user: user[1]
            })
        })
        .catch(err => {
            res.json({
                status: "ERROR",
                err
            })
        })
})

router.put('/update/:uuid/password', async (req, res) => {
    const body = req.body;

    let {password, newPassword} = body;
    
    // Check to see if provided password matches that of current user
    bcrypt.compare(password, req.user.password, async (err, match) => {
        if (!match) {
            res.json({
                status: "ERROR",
                err: 'Provided password does not match our records'
            })
        }
        if (err) {
            res.json({
                status: "ERROR",
                err
            })
        }
        newPassword = await bcrypt.hashSync(newPassword, 10);
        User.update(
            { password: newPassword },
            { 
                where: { uuid: req.params.uuid } ,
                returning: true,
                plain: true
            }
        )
            .then(user => {
                res.json({
                    status: "SUCCESS",
                    user: user[1]
                })
            })
            .catch(err => {
                res.json({
                    status: "ERROR",
                    err
                })
            })
    })
})

router.post('/search', async (req, res) => {
    // Get all friends for that search
    let users = await User.findAll({
        where: {
            username: { [Op.iLike]: req.body.search + "%" }
        },
        order: [["username",  "ASC"]]
    })
    // Current friends
    let friendId= await Friend.findAll({
        where: { friendOf: req.user.uuid }
    })
    let friendIds = [];
    friendId.forEach(instance => friendIds.push(instance.userId))
    // Get all outstanding requests that may be related to your search
    let incoming = await Request.findAll({
        where: { userTo: req.user.uuid },
    });
    let incomingIds= [];
    incoming.forEach(instance => {
        incomingIds.push(instance.dataValues.authorId)
    })
    let outgoing = await Request.findAll({
        where: { authorId: req.user.id }
    });
    let searchArray = []
    outgoing.forEach(request => {
        searchArray.push(request.userTo)
    });
    let outgoingUsers = await User.findAll({
        where: { uuid: { [Op.in]: searchArray } }
    });
    // Get the ids of all users in outgoing search results
    let outgoingRequests = []
    outgoingUsers.forEach(user => {
        outgoingRequests.push(user.dataValues.id)
    })
    
    const pending = incomingIds.concat(outgoingRequests)
    res.json({
        status: "SUCCESS",
        searchResults: users,
        pending,
        friendIds
    })
}) 

module.exports = router;