require("dotenv").config("./.env");
const User = require("../db").User;
const Conversation = require("../db").Conversation;
const Message = require("../db").Message;
const UserConversation = require('../db').UserConversation
const { Op } = require("sequelize");
const supertest = require("supertest");
const http = require('../index');

describe('Conversation testing', () => {
    let userToken = ''
    let userObj;
    let friendUsers = []
    let conversationIDs = []
    let messageIDs = []

    // Get the user token
    beforeAll(async () => {
        // Login blank user
        let user = await supertest(http).post('/user/login').send({ email: "blank@test.com", password: "test" })
        user = user.body
        userToken = user.sessionToken
        userObj = user.user

        // Create four users to send requests to
        for(let i = 1; i <= 4; i++) {
            let name = 'friend' + i
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

    // Create single chat
    test('Create a 2 user chat', async  () => {
        let bodyObj = {
            friendIds: [friendUsers[0].id],
            content: 'Hello test 1'
        }
        let request = await supertest(http).post('/conversation/create').set('Authorization', userToken).send(bodyObj)
        request = request.body
        conversationIDs.push(request.conversationId)
        expect(request.status).toBe("SUCCESS")
        expect(conversationIDs.length).toBe(1)
    })
    
    // Create group chat
    test('Create a 3 user chat',async () => {
        let bodyObj = {
            friendIds: [friendUsers[1].id, friendUsers[2].id],
            content: 'Hello test 2'
        }
        let request = await supertest(http).post('/conversation/create').set('Authorization', userToken).send(bodyObj)
        request = request.body
        conversationIDs.push(request.conversationId)
        expect(request.status).toBe("SUCCESS")
        expect(conversationIDs.length).toBe(2)
    })    

    // Archive single chat (first  in idArr)
    test('Archive a chat', async () =>  {
        let conversation = conversationIDs[0]
        let request = await supertest(http).post(`/conversation/archive/${conversation}`).set('Authorization', userToken)
        request =  request.body
        expect(request.status).toBe("SUCCESS")
    })

    // Get the archived  chats
    test('Get archived chats', async () => {
        let request = await supertest(http).get('/conversation/archived').set('Authorization', userToken)
        request = request.body
        expect(request.status).toBe('SUCCESS')
        expect(request.conversations.length).toBe(1)
    })

    // Unarchive a chat
    test('Unarchive a chat', async () =>  {
        let conversation = conversationIDs[0]
        let request = await supertest(http).delete(`/conversation/unarchive/${conversation}`).set('Authorization', userToken)
        request =  request.body
        expect(request.status).toBe("SUCCESS")
    })

    // Get all unarchived chats
    test('Get unarchived chats', async () => {
        let request = await supertest(http).get('/conversation/all').set('Authorization', userToken)
        request = request.body
        expect(request.status).toBe('SUCCESS')
        expect(request.conversations.length).toBe(2)
    })

    // Add user to group chat
    test('Add user to group chat', async () => {
        let conversation = conversationIDs[1]
        let userIds = [friendUsers[3].id]
        let bodyObj = {
            userIds
        }
        let request = await supertest(http).post(`/conversation/add-user/${conversation}`).set('Authorization', userToken).send(bodyObj)
        request = request.body
        expect(request.status).toBe('SUCCESS')
        expect(request.users.length).toBeGreaterThanOrEqual(1)
    })

    // Give group chat a name - empty value
    test('Give group chat a name - empty value', async () => {
        let conversation = conversationIDs[1]
        let bodyObj = {
            name: 'testName',
            backgroundColor: ''
        }
        let request = await supertest(http).put(`/conversation/update/${conversation}`).set('Authorization', userToken).send(bodyObj)
        request = request.body
        expect(request.status).toBe('ERROR')
        expect(request.message).toBe("Please ensure a color is selected")
    })

    // Give group chat a name - success
    test('Give group chat a name - success', async () => {
        let conversation = conversationIDs[1]
        let bodyObj = {
            name: 'testName',
            backgroundColor: 'pink'
        }
        let request = await supertest(http).put(`/conversation/update/${conversation}`).set('Authorization', userToken).send(bodyObj)
        request = request.body
        expect(request.status).toBe('SUCCESS')
        expect(request.editedConversation).toBeDefined()
        expect(request.editedConversation.id).toBeDefined()
    })

    // Send a message to group chat - empty field
    test('Send message to group chat - empty value', async () => {
        let conversation = conversationIDs[1]
        let bodyObj = {
            content: '',
            conversationId: conversation
        }
        let request = await supertest(http).post(`/message/create`).set('Authorization', userToken).send(bodyObj)
        request = request.body
        expect(request.status).toBe('ERROR')
        expect(request.message).toBe("Please ensure the content field is filled in")
    })

    // Send a message to group chat - success
    test('Send message to group chat - success', async () => {
        let conversation = conversationIDs[1]
        let bodyObj = {
            content: 'Hello test 3??',
            conversationId: conversation
        }
        let request = await supertest(http).post(`/message/create`).set('Authorization', userToken).send(bodyObj)
        request = request.body
        expect(request.status).toBe('SUCCESS')
        expect(request.message).toBeDefined()
        expect(request.message.id).toBeDefined()
    })

    // Get chat window view information
    test('Ensure conversation window is grabbing necesary data', async () => {
        let conversation = conversationIDs[1]
        let request = await supertest(http).post(`/conversation/${conversation}`).set('Authorization', userToken)
        request = request.body
        expect(request.status).toBe("SUCCESS")
        expect(request.conversation).toBeDefined();
    })

    // Tear down all db objects
    afterAll(async () => {
        // Remove all users
        let friendArr = friendUsers.map(friend => friend.id)
        User.destroy({
            where: { id: { [Op.in]: friendArr } }
        })
        // Remove all conversations
        Conversation.destroy({
            where: { id: { [Op.in]: conversationIDs } }
        })
        UserConversation.destroy({
            where: { conversationId: { [Op.in]: conversationIDs }  }
        })
        // Remove all messages assc with messages
        Message.destroy({
            where: { conversationId: { [Op.in]: conversationIDs } }
        })
        Message.destroy({
            where: { conversationId: null }
        })
    })
})