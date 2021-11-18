const Friend = require("../../db").Friend;
const User = require("../../db").User;
const { v4: uuidv4 } = require('uuid');

const mainTestUser = {
    username: "JMIJake",
    id: 2,
    uuid: "6910c23b-b474-49a9-801c-479312b15d9f"
}

const friendsOfMainTest = [
    {
        username: "IsaacWeir",
        id: 17,
        uuid: "e1dd95af-d046-477a-bd75-222889e0853f"
    },
    {
        username: "pops",
        id: 18,
        uuid: "9034a9bf-38f1-4db4-aa54-850cc0ea544d"
    },
    {
        username: "LandonValley",
        id: 20,
        uuid: "de1cc6b0-c00e-4a83-8480-48f778e0584c"
    },
    {
        username: "SaraFrazier",
        id: 23,
        uuid: "f54ea8c1-19f4-415b-82c4-005ca2d1eb2f"
    }
]

const createFriendships = async () => {
    // Create two friend db entries where the user is both the friendOf and the userId
    friendsOfMainTest.forEach(async user => {
        let uuid1 = await uuidv4();
        let friendship1 = await Friend.create({
            uuid: uuid1,
            friendOf: user.uuid,
            userId: mainTestUser.id
        })
        console.log('friendship1 created')
        let uuid2 = await uuidv4();
        let friendship2 = await Friend.create({
            uuid: uuid2,
            friendOf: mainTestUser.uuid,
            userId: user.id
        })
        console.log('friendship2 created')
    })
}

module.exports =  { createFriendships }