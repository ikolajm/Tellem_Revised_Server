const router = require("express").Router();
const Friend = require("../../db").Friend;
const User = require("../../db").User;
const { v4: uuidv4 } = require('uuid');
const Request= require('../../db').FriendRequest;

// Create request
router.post("/create/:uuid", async (req, res) => {
    let uuid = await uuidv4();
    Request.create({
        uuid,
        userTo: req.params.uuid,
        authorId: req.user.id
    })
    .then(created => res.json({ status: "SUCCESS" }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

// Cancel Request
router.delete("/delete/:id", async (req, res) => {
    Request.destroy({
        where: { id: req.params.id, authorId: req.user.id }
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