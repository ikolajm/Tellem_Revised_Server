require("dotenv").config("./.env");
const User = require("../db").User;
const { Op } = require("sequelize");
const supertest = require("supertest");
const http = require('../index');

describe('User profile edit testing', () => {
    let userToken = ''
    // Get the user token
    beforeAll(async () => {
        let user = await supertest(http).post('/user/login').send({ email: "blank@test.com", password: "test" })
        user = user.body
        userToken = user.sessionToken
    })

    test('Edit user information - empty value', async () => {
        let bodyObj = {
            username: 'blankuser',
            email: 'blank@test.com',
            idCode: 33820,
            backgroundColor: ''
        }
        let request = await supertest(http).put('/user/update/89b50aae-f21b-483b-8510-2ce153e92977').set('Authorization', userToken).send(bodyObj)
        request = request.body
        expect(request.status).toBe("ERROR")
        expect(request.message).toBe("All fields must be filled in")
    })

    test('Edit user information - success', async () => {
        let bodyObj = {
            username: 'blankuser',
            email: 'blank@test.com',
            idCode: 33820,
            backgroundColor: 'pink'
        }
        let request = await supertest(http).put('/user/update/89b50aae-f21b-483b-8510-2ce153e92977').set('Authorization', userToken).send(bodyObj)
        request = request.body
        expect(request.status).toBe("SUCCESS")
        expect(request.user).toBeDefined()
        expect(request.user.id).toBeDefined()
    })

    test('Edit user password - empty field', async () => {
        let bodyObj = {
            newPassword: "test",
            confirmNewPassword: "",
            password: "testing",
        }
        let request = await supertest(http).put('/user/update/89b50aae-f21b-483b-8510-2ce153e92977/password').set('Authorization', userToken).send(bodyObj)
        request = request.body
        expect(request.status).toBe("ERROR")
        expect(request.message).toBe("All fields must be filled in")
    })

    test('Edit user password - Fields do not match', async () => {
        let bodyObj = {
            newPassword: "test",
            confirmNewPassword: "testing",
            password: "testing",
        }
        let request = await supertest(http).put('/user/update/89b50aae-f21b-483b-8510-2ce153e92977/password').set('Authorization', userToken).send(bodyObj)
        request = request.body
        expect(request.status).toBe("ERROR")
        expect(request.message).toBe("New password does not match the confirmation password")
    })

    test('Edit user password - incorrect password confirmation', async () => {
        let bodyObj = {
            newPassword: "test",
            confirmNewPassword: "test",
            password: "testing",
        }
        let request = await supertest(http).put('/user/update/89b50aae-f21b-483b-8510-2ce153e92977/password').set('Authorization', userToken).send(bodyObj)
        request = request.body
        expect(request.status).toBe("ERROR")
        expect(request.message).toBe("Provided password does not match our records")
    })

    test('Edit user password - successful', async () => {
        let bodyObj = {
            newPassword: "test",
            confirmNewPassword: "test",
            password: "test",
        }
        let request = await supertest(http).put('/user/update/89b50aae-f21b-483b-8510-2ce153e92977/password').set('Authorization', userToken).send(bodyObj)
        request = request.body
        expect(request.status).toBe("SUCCESS")
        expect(request.user).toBeDefined()
    })
})

describe('User search test', () => {
    let userToken = ''
    // Get the user token
    beforeAll(async () => {
        let user = await supertest(http).post('/user/login').send({ email: "blank@test.com", password: "test" })
        user = user.body
        userToken = user.sessionToken
    })

    test('User search - missing fields', async () => {
        let bodyObj = {
            search: ''
        }
        let request = await supertest(http).post('/user/search').set('Authorization', userToken).send(bodyObj)
        request = request.body
        expect(request.status).toBe("ERROR")
        expect(request.message).toBe("All fields must be filled in")
    })

    test('User successfully retrieved on case insensitive search', async () => {
        let bodyObj = {
            search: 'se'
        }
        let request = await supertest(http).post('/user/search').set('Authorization', userToken).send(bodyObj)
        request = request.body
        expect(request.status).toBe("SUCCESS")
        expect(request.searchResults.length).toBeGreaterThanOrEqual(1)
        expect(request.searchResults[0].id).toBeDefined()
    })
})