const { v4: uuidv4 } = require('uuid');
const UserConversation = require("../../db").UserConversation;
const Conversation = require("../../db").Conversation;
const colorGenerator = require("../../helpers/backgroundGenerator");

const conversations = [
    {
        name: "Boys Chat",
        users: [
            {
                username: "IsaacWeir",
                id: 17,
                uuid: "e1dd95af-d046-477a-bd75-222889e0853f"
            },
            {
                username: "JMIJake",
                id: 2,
                uuid: "6910c23b-b474-49a9-801c-479312b15d9f"
            },
            {
                username: "LandonValley",
                id: 20,
                uuid: "de1cc6b0-c00e-4a83-8480-48f778e0584c"
            },
        ]
    },
    {
        name: "",
        users: [
            {
                username: "JMIJake",
                id: 2,
                uuid: "6910c23b-b474-49a9-801c-479312b15d9f"
            },
            {
                username: "pops",
                id: 18,
                uuid: "9034a9bf-38f1-4db4-aa54-850cc0ea544d"
            }
        ]
    }
]

const createConversations = async () => {
    conversations.forEach(async conversation => {
        let uuid1 = await uuidv4();
        // Create conversations
        let createdConversation = await Conversation.create({
            uuid: uuid1,
            name: conversation.name,
            backgroundColor: colorGenerator.generate()
        })
        // Create userConversationArchive instances
        let users = conversation.users;
        const forLoop = async () => {
            for (let i = 0; i < users.length; i++) {
                let uuid2 = await uuidv4();
                UserConversation.create({
                    uuid: uuid2,
                    userId: users[i].id,
                    conversationId: createdConversation.id
                })
            }
            return true;
        }
        let loop = await forLoop();
    });
}

module.exports = { createConversations }