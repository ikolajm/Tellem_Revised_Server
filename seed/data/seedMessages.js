const Message = require("../../db").Message;
const { v4: uuidv4 } = require('uuid');

const conversations = [
    {
        name: "Boys Chat",
        id: 3,
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
            }
        ]
    },
    {
        name: "",
        id: 4,
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

const groupMessages = [
    {
        content:  "Yo, just was wanting to see what everyone is up to this weekend?",
        author: {
            username:  "LandonValley",
            id: 20
        }
    },
    {
        content:  "Not too much, were you guys wanting to hang out tonight?",
        author: {
            username:  "JMIJake",
            id: 2
        }
    },
    {
        content:  "Because I'm looking for a reason to get out of my house tbh",
        author: {
            username:  "JMIJake",
            id: 2
        }
    },
    {
        content:  "I'm available after work, I should get off around 8pm tonight",
        author: {
            username:  "IsaacWeir",
            id: 17
        }
    },
    {
        content:  "We can plan on meeting at my place and perhaps walking to a bar",
        author: {
            username:  "IsaacWeir",
            id: 17
        }
    },
    {
        content:  "Sounds like a plan to me, see you there!",
        author: {
            username:  "LandonValley",
            id: 20
        }
    }
]

const singleChatMessages= [
    {
        content:  "Hey Pops, just checking to see how my newest version of Tellem is coming along!",
        author: {
            username:  "JMIJake",
            id: 2
        }
    },
    {
        content:  "Very well, I'm getting your message no issue",
        author: {
            username:  "pops",
            id: 18
        }
    },
    {
        content:  "Well that is great news, do you have anything exciting going on today?",
        author: {
            username:  "JMIJake",
            id: 2
        }
    },
    {
        content:  "Any yard work that you could need some help with?",
        author: {
            username:  "JMIJake",
            id: 2
        }
    },
    {
        content:  "You know what, I may need some help shoverling some snow this afternoon if you are available",
        author: {
            username:  "pops",
            id: 18
        }
    },
    {
        content:  "I can do that, just give me the word and I'll be at your place place with a shovel!!",
        author: {
            username:  "JMIJake",
            id: 2
        }
    }
]

const createMessages = async () => {
    conversations.forEach(async (conversation, index) => {
        // If group message
        if (index === 0) {
            let messages = [...groupMessages]
            messages.forEach(async message => {
                let uuid = await uuidv4();
                let createdMessage = await Message.create({
                    uuid: uuid,
                    content: message.content,
                    type: "text",
                    hidden: false,
                    author: message.author.id,
                    conversationId: conversation.id,
                    edited: false
                })
            })
        } else {
            let messages = [...singleChatMessages]
            messages.forEach(async message => {
                let uuid = await uuidv4();
                let createdMessage = await Message.create({
                    uuid: uuid,
                    content: message.content,
                    type: "text",
                    hidden: false,
                    author: message.author.id,
                    conversationId: conversation.id,
                    edited: false
                })
            })
        }
    })
}

module.exports = { createMessages }