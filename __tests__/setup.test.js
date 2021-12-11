const request = require("supertest");
const http = require('../index');

describe('Initial test to see if jest is working', () => {
    test('1 === 1', () => {
        expect(1).toBe(1);
        // done()
    })

    test('See if export is working sucessfully', async () => {
        const response = await request(http).get("/")
        expect(response.body.message).toBe("Base endpoint reached successfully!");
        // done()
    })
})