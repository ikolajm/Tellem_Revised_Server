const router = require("express").Router();
const User = require('../../db').User;
const UserConversation = require("../../db").UserConversation;
const UserConversationArchive = require("../../db").UserConversationArchive;
const Conversation = require("../../db").Conversation;
const Message = require("../../db").Message;
const colorGenerator = require("../../helpers/backgroundGenerator");
const { Op } = require("sequelize");
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');
const formatConversationList = require("../../helpers/dataFormatting/formatConversationList");
const formatSingleConversation = require("../../helpers/dataFormatting/formatSingleConversation");

// Get all unarchived messages for user feed
router.get('/all', async (req, res) => {
    let user = req.user;
    // Get archives to add to query criteria
    let archives = await UserConversationArchive.findAll({
        where: { userId: user.id },
        attributes: ["conversationId"]
    })
    let archiveIds = [];
    archives.forEach(archive => archiveIds.push(archive.conversationId))

    // Get all conversations that user is involved in
    let userConversations = await UserConversation.findAll({
        where: {
            [Op.and]: [
                { userId: req.user.id },
                { conversationId: { [Op.notIn]: archiveIds } }
            ]
        }
    })

    let conversations = await formatConversationList.formatConversations(userConversations);

    res.json({
        status: "SUCCESS",
        conversations
    })
})

// Get batch of messages for conversation + all users involved
router.post("/:id", async (req, res) => {
    // Get all conversations that user is involved in
    let conversation = await UserConversation.findOne({
        where: { conversationId: req.params.id }
    })

    let obj = await formatSingleConversation.formatSingle(conversation);

    res.json({
        status: "SUCCESS",
        conversation: obj
    })
})

// Get all archived conversations
router.get("/archived", async (req, res) => {
    // Get archives to add to query criteria
    let archives = await UserConversationArchive.findAll({
        where: { userId: req.user.id },
        attributes: ["conversationId"]
    })
    let archiveIds = [];
    archives.forEach(archive => archiveIds.push(archive.conversationId))

    // Get all conversations that user is involved in
    let userConversations = await UserConversation.findAll({
        where: {
            [Op.and]: [
                { userId: req.user.id },
                { conversationId: { [Op.in]: archiveIds } }
            ]
        }
    })

    let conversations = await formatConversationList.formatConversations(userConversations);

    res.json({
        status: "SUCCESS",
        conversations
    })
})

// Archive a conversation
router.get("/archive/:id", async (req, res) => {
    let uuid = await uuidv4();
    let archive = {
        uuid,
        userId: req.user.id,
        conversationId: req.params.id
    }

    UserConversationArchive.create(archive)
    .then(created => res.json({ status: "SUCCESS" }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

// Unarchive a conversation
router.delete("/unarchive/:id", async (req, res) => {
    UserConversationArchive.destroy({
        where: { userId: req.user.id, conversationId: req.params.id }
    })
    .then(deleted => res.json({ status: "SUCCESS" }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

// Create conversation
router.post("/create", async (req, res) => {
    let uuid1 = await uuidv4();
    // Create conversations
    let conversation = await Conversation.create({
        uuid: uuid1,
        name: "",
        backgroundColor: colorGenerator.generate()
    })
    // Create userConversationArchive instances
    let users = [req.body.friendId];
    users.push(req.user.id)
    const forLoop = async () => {
        for (let i = 0; i < users.length; i++) {
            let uuid2 = await uuidv4();
            UserConversation.create({
                uuid: uuid2,
                userId: users[i],
                conversationId: conversation.id
            })
        }
        return true;
    }
    let loop = await forLoop();
    // Create message and assign to user conversation
    let uuid3 = await uuidv4();
    Message.create({
        uuid: uuid3,
        content: req.body.content,
        type: "text",
        hidden: false,
        author: req.user.id,
        conversationId: conversation.id,
        edited: false
    })

    res.json({
        status: "SUCCESS",
        conversationId: conversation.id
    })
})

// Add user to conversation
router.post("/add-user/:id", async (req, res) => {
    // Get the ids of the new users
    let userIds = req.body.userIds
    // Create user conversation for new users
    userIds.forEach(id => {
        let uuid = uuidv4()
        let obj = {
            uuid,
            userId: id,
            conversationId: req.params.id
        }
        let conversation = UserConversation.create(obj)
    })
    // Get all new users, and return them to be added to the user array client side
    let allUsers = await User.findAll({
        where: { id: { [Op.in]: userIds }}
    })
    
    if (allUsers.length > 0) {
        res.json({
            status: "SUCCESS",
            users: allUsers
        })
    }
})

// Save changes to conversation
router.put("/update/:id", async (req, res) => {
    let { backgroundColor, name } = req.body;
    let conversationEdit = await Conversation.update(
        {
            backgroundColor,
            name
        },
        {
            where: { id: req.params.id },
            returning: true,
            plain: true
        }
    )

    res.json({
        status: "SUCCESS",
        editedConversation: conversationEdit[1]
    })
});

module.exports = router;