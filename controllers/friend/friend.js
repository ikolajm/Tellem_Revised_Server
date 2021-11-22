const router = require("express").Router();
const Friend = require("../../db").Friend;
const User = require("../../db").User;
const { Op } = require("sequelize");

router.get("/all", async (req, res) => {
    // Get all friends of the user
    let friends = await Friend.findAll({
        where: { friendOf: req.user.uuid },
        order: [["createdAt", "ASC"]],
        include: {
            model: User,
            order: [["username", "DESC"]]
        }
    })

    res.json({
        status: "SUCCESS",
        friends
    })
})

router.post("/delete", async (req, res) => {
    let userFriendship = await Friend.findOne({
        where: { userId: req.user.id, friendOf: req.body.friendUuid }
    })

    let friendFriendship = await Friend.findOne({
        where: { userId: req.body.friendId, friendOf: req.user.uuid }
    })

    let deleteIds = [userFriendship.id, friendFriendship.id];

    Friend.destroy({
        where: { id: { [Op.in]: deleteIds } }
    })
    .then(deleted => res.json({ status: "SUCCESS" }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

module.exports = router; 