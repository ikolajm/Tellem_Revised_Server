const FriendRequest = require("../../db").FriendRequest;
const User = require("../../db").User;
const Friend = require("../../db").Friend;

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

    const {password} = body;
    User.update(
        { password: password },
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
                message: err
            })
        })
})

router.get('/search', async (req, res) => {
    // Get all friends for that search
    let users = await User.findAll({
        where: {
            username: { [Op.iLike]: req.body.username + "%" }
        }
    })
    // Current friends
    let friendId= await Friend.findAll({
        where: { friendId: req.user.uuid }
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