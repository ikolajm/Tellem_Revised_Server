const router = require("express").Router();
const Friend = require("../../db").Friend;
const User = require("../../db").User;
const { v4: uuidv4 } = require('uuid');
const Request= require('../../db').FriendRequest;
const { Op } = require("sequelize");

// Get all requests
router.get("/request/all", async (req, res) => {
    // Get all requests of the user
    let incoming = await Request.findAll({
        where: { userTo: req.user.uuid },
        order: [["createdAt", "ASC"]],
        include: {
            model: User,
        }
    })
    incoming = incoming.map(request => {
        let incomingObj = {
            id: request.id,
            uuid: request.uuid,
            type: "incoming",
            user: request.user
        }
        return incomingObj
    })
    let outgoingRequests = await Request.findAll({
        where: { authorId: req.user.id },
        order: [["createdAt", "ASC"]],
    })
    let outgoingRequestUuid = outgoingRequests.map(request => request.userTo)
    let outgoingUsers = await User.findAll({
        where: { uuid: { [Op.in]: outgoingRequestUuid } }
    })
    let outgoing = outgoingRequests.map(request => {
        let  outgoingUser = outgoingUsers.findIndex(userObj => {
            return userObj.uuid === request.userTo
        })
        let outgoingObj =  {
            id: request.id,
            uuid: request.uuid,
            type: 'outgoing',
            user: outgoingUsers[outgoingUser]
        }
        return outgoingObj
    })

    let requests = incoming.concat(outgoing);

    res.json({
        status: "SUCCESS",
        requests
    })
})

// Create request
router.post("/create/:uuid", async (req, res) => {
    let uuid = await uuidv4();
    Request.create({
        uuid,
        userTo: req.params.uuid,
        authorId: req.user.id
    })
    .then(created => res.json({ status: "SUCCESS", created }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

// Cancel Request
router.delete("/request/delete/:uuid", async (req, res) => {
    Request.destroy({
        where: { uuid: req.params.uuid, authorId: req.user.id }
    })
    .then(deleted => res.json({ status: "SUCCESS" }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

// Accept Request
router.post("/accept/:uuid", async (req, res) => {
    let uuid1 = await uuidv4();
    let createFriendShip1 = await Friend.create({
        uuid: uuid1,
        friendOf: req.body.friendUuid,
        userId: req.user.id
    })
    let uuid2 = await uuidv4();
    let createFriendShip2 = await Friend.create({
        uuid: uuid2,
        friendOf: req.user.uuid,
        userId: req.body.friendId
    })
    Request.destroy({
        where: { uuid: req.params.uuid }
    })
    .then(deleted => res.json({ status: "SUCCESS" }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

// Decline request
router.delete("/decline/:uuid", async (req, res) => {
    Request.destroy({
        where: { uuid: req.params.uuid }
    })
    .then(deleted => res.json({ status: "SUCCESS" }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

module.exports = router