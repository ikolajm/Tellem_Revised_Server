const router = require("express").Router();
const User = require('../../db').User;
const Message = require("../../db").Message;
const { v4: uuidv4 } = require('uuid');

// Create conversation
router.post("/create", async (req, res) => {
    let uuid1 = await uuidv4();
    let message = await Message.create({
        uuid: uuid1,
        content: req.body.content,
        type: "text",
        hidden: false,
        author: req.user.id,
        conversationId: req.body.conversationId,
        edited: false,
    })

    message.dataValues.user = req.user

    res.json({
        status: "SUCCESS",
        message
    })
})

// Edit message
router.put("/edit/:id", async (req, res) => {
    let messageEdit = await Message.update(
        {
            content: req.body.content,
            edited: true
        },
        {
            where: { id: req.params.id },
            returning: true,
            plain: true
        }
    )

    res.json({
        status: "SUCCESS",
        message
    })
})

// Edit message
router.delete("/delete/:id", async (req, res) => {
    Message.destroy(
        {
            where: { id: req.params.id },
        }
    )
        .then(destroyed => {
            res.json({
                status: "SUCCESS",
                message: "Message deleted!"
            })
        })
        .catch(err => {
            status: "ERROR",
            err
        })

})

module.exports = router;