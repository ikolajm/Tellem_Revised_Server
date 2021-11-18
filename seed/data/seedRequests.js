const { v4: uuidv4 } = require('uuid');
const Request = require('../../db').FriendRequest;

const mainTestUser = {
    username: "JMIJake",
    id: 2,
    uuid: "6910c23b-b474-49a9-801c-479312b15d9f"
}

const incomingUsers = [
    {
        username: "NatalieHamm",
        id: 19,
        uuid: "dd955c04-2b13-4922-9110-a385840103ab"
    },
    {
        username: "SethKiser",
        id: 23,
        uuid: "f54ea8c1-19f4-415b-82c4-005ca2d1eb2f"
    }
]

const outgoingUsers = [
    {
        username: "TylerMojo",
        id: 22,
        uuid: "4c032725-3a9f-44ca-a3ad-4611145be432"
    }
]

const createRequests = () => {
    // Create incoming requests
    incomingUsers.forEach(async user => {
        let uuid = await uuidv4();
        let createRequest = await Request.create({
            uuid,
            userTo: mainTestUser.uuid,
            authorId: user.id
        })
        console.log('Request created')
    })
    outgoingUsers.forEach(async user => {
        let uuid = await uuidv4();
        let createRequest = await Request.create({
            uuid,
            userTo: user.uuid,
            authorId: mainTestUser.id
        })
        console.log('request created')
    })
} 

module.exports = {createRequests}