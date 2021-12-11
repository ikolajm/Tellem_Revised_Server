require("dotenv").config("./.env");
const User = require("../db").User;
const { Op } = require("sequelize");
const supertest = require("supertest");
const http = require('../index');

describe('Login testing', () => {
    test('Login with a missing field', async () => {
        const bodyObj = {
            email: 'blank@test.com',
            password: ''
        }
        let request = await supertest(http).post('/user/login').send(bodyObj)
        request = request.body
        expect(request.status).toBe("ERROR")
        expect(request.message).toBe("Cannot create account with null fields")
    })

    test('Forms filled, email not found', async () => {
        const bodyObj = {
            email: 'blan@test.com',
            password: 'test'
        }
        let request = await supertest(http).post('/user/login').send(bodyObj)
        request = request.body
        expect(request.status).toBe("ERROR")
        expect(request.message).toBe("Account not found with that email")
    })

    test('Forms filled, correct email but incorrect password', async () => {
        const bodyObj = {
            email: 'blank@test.com',
            password: 'testt'
        }
        let request = await supertest(http).post('/user/login').send(bodyObj)
        request = request.body
        expect(request.status).toBe("ERROR")
        expect(request.message).toBe("Password does not match the provided email")
    })

    test('Forms filled, successful user return', async () => {
        const bodyObj = {
            email: 'blank@test.com',
            password: 'test'
        }
        let request = await supertest(http).post('/user/login').send(bodyObj)
        request = request.body
        expect(request.status).toBe("SUCCESS")
        expect(request.sessionToken).toBeDefined()
        expect(request.user).toBeDefined()
        expect(request.user.id).toBeDefined()
    })
})

describe('Signup testing', () => {
    let testCreationArray = [];

    // Delete all user created in testing
    afterAll(() => {
        User.destroy({
            where: { id: { [Op.in]: testCreationArray} }
        })
    })

    test('Signup with a missing field', async () => {
        const bodyObj = {
            username: 'newuser',
            email: 'newuser@test.com',
            password: '',
            confirmPassword: 'test'
        }
        let request = await supertest(http).post('/user/create').send(bodyObj)
        request = request.body
        expect(request.status).toBe("ERROR")
        expect(request.message).toBe("Cannot create user with missing fields")
    })

    test('Signup with filled in forms, but that email already exists',  async () => {
        const bodyObj = {
            username: 'newuser',
            email: 'blank@test.com',
            password: 'testing',
            confirmPassword: 'testing'
        }
        let request = await supertest(http).post('/user/create').send(bodyObj)
        request = request.body
        expect(request.status).toBe("ERROR")
        expect(request.message).toBe("An account is already using that email")
    })

    test('Forms filled, successful user return', async () => {
        const bodyObj = {
            username: 'newuser',
            email: 'newuser@test.com',
            password: 'test',
            confirmPassword: 'test'
        }
        let request = await supertest(http).post('/user/create').send(bodyObj)
        request = request.body
        expect(request.status).toBe("SUCCESS")
        expect(request.sessionToken).toBeDefined()
        expect(request.user).toBeDefined()
        expect(request.user.id).toBeDefined()
        testCreationArray.push(request.user.id)
    })
})