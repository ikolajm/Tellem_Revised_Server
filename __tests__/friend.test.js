require("dotenv").config("./.env");
const User = require("../db").User;
const FriendRequest = require("../db").FriendRequest;
const Friend = require("../db").Friend;
const { Op } = require("sequelize");
const supertest = require("supertest");
const http = require('../index');

describe('Friend tests', () => {
    let userToken = ''
    let userObj;
    let friendUsers = []
    let incomingRequests = []
    let outgoingRequests = []

    // Get the user token
    beforeAll(async () => {
        let user = await supertest(http).post('/user/login').send({ email: "blank@test.com", password: "test" })
        user = user.body
        userToken = user.sessionToken
        userObj = user.user

        // Create four users to send requests to
        for(let i = 1; i <= 4; i++) {
            let name = 'request' + i
            let email = `${name}@test.com`
            let password = 'test'
            let bodyObj = {
                username: name,
                email,
                password,
                confirmPassword: password
            }
            let user = await supertest(http).post('/user/create').send(bodyObj)
            user = user.body
            user.user.sessionToken = user.sessionToken
            friendUsers.push(user.user)
        }
    })

    test('Ensure that the friend arrray is ready for the incoming tests', () => {
        expect(friendUsers.length).toBe(4)
    })

    // Create request
    // Send 1 request from blank to request1
    // Have 3 requests sent to blank from the remaining request accounts
    test('Able to send friend request', async () => {
        let request1 = await supertest(http).post(`/friend/create/${friendUsers[0].uuid}`).set('Authorization', userToken)
        request1 = request1.body
        request1 = request1.created
        outgoingRequests.push(request1)
        expect(request1.id).toBeDefined()
        expect(request1.authorId).toBe(userObj.id)
        let nums = [2, 3, 4]
        for (const i of nums) {
            // Get user credentials
            let newToken = await supertest(http).post('/user/login').send({ email: `request${i}@test.com`, password: "test" })
            newToken = newToken.body
            newToken = newToken.sessionToken
            expect(newToken).toBeDefined()
            // Create request with user data
            let request = await supertest(http).post(`/friend/create/${userObj.uuid}`).set('Authorization', newToken)
            request = request.body
            request = request.created
            incomingRequests.push(request)
            expect(request.id).toBeDefined()
            expect(request.userTo).toBe(userObj.uuid)
        }
        expect(outgoingRequests.length).toBe(1)
        expect(incomingRequests.length).toBe(3)
    })

    // Get all requests
    test('Able to retrieve all friend requests', async () => {
        let requests = await supertest(http).get(`/friend/request/all`).set('Authorization', userToken)
        requests = requests.body
        expect(requests.status).toBe("SUCCESS")
        expect(requests.requests.length).toBe(4)
        expect(requests.requests[0].id).toBeDefined()
    })

    // Cancel - cancel request1 (deleted)
    test('Able to cancel friend request', async() => {
        let requestUUID = outgoingRequests[0].uuid
        let cancel = await supertest(http).delete(`/friend/request/delete/${requestUUID}`).set('Authorization', userToken)
        cancel = cancel.body
        expect(cancel.status).toBe("SUCCESS")
    })

    // Accept request from request2 (deleted)
    test('Able to accept friend request', async () => {
        let requestUUID = incomingRequests[0].uuid
        let  bodyObj =  {
            friendUuid: friendUsers[1].uuid,
            friendId: friendUsers[1].id
        }
        let accept = await supertest(http).post(`/friend/accept/${requestUUID}`).send(bodyObj).set('Authorization', userToken)
        accept = accept.body
        expect(accept.status).toBe("SUCCESS")
    })

    // Decline request from request 3 (deleted)
    test('Able to decline friend request', async () => {
        let requestUUID = incomingRequests[1].uuid
        let decline = await supertest(http).delete(`/friend/decline/${requestUUID}`).set('Authorization', userToken)
        decline = decline.body
    })

    // Get friends
    test('Able to retrieve friends of user (request2)', async () => {
        let friends = await supertest(http).get(`/friend/all`).set('Authorization', userToken)
        friends = friends.body
        expect(friends.status).toBe("SUCCESS")
        expect(friends.friends.length).toBe(1)
        expect(friends.friends[0].id).toBeDefined()
    })

    // Delete friend
    test('Able to remove friend', async () => {
        let requestUUID = incomingRequests[0].uuid
        let remove = await supertest(http).delete(`/friend/decline/${requestUUID}`).set('Authorization', userToken)
        remove = remove.body
        expect(remove.status).toBe("SUCCESS")
    })

    // Clear all test data (remove users (request1234), requests (request4))
    afterAll(async () => {
        // Remove all users
        let friendID = []
        for (let i = 0; i < friendUsers.length ; i++) {
            let toBeDeleted = friendUsers[i]
            friendID.push(toBeDeleted.id)
        }
        User.destroy({
            where: { id: { [Op.in]: friendID } } 
        })
        // Desroy all friend requests
        let outgoingID = []
        for (let i = 0; i < incomingRequests.length ; i++) {
            let toBeDeleted = incomingRequests[i]
            outgoingID.push(toBeDeleted.id)
        }
        FriendRequest.destroy({
            where: { id: { [Op.in]: outgoingID } }
        })
        let incomingID = []
        for (let i = 0; i < incomingRequests.length ; i++) {
            let toBeDeleted = incomingRequests[i]
            incomingID.push(toBeDeleted.id)
        }
        FriendRequest.destroy({
            where: { id: { [Op.in]: incomingID } }
        })
        // Destroy all friendships
        Friend.destroy({
            where: { id: friendUsers[1].id }
        })
        Friend.destroy({
            where: {
                [Op.and]: [
                    { friendOf: userObj.uuid },
                    { userId: null }
                ]
            }
        })
        Friend.destroy({
            where: { userId: userObj.id }
        })
    })
})