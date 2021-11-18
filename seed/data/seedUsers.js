const colorGenerator = require("../../helpers/backgroundGenerator");
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../../db').User;

const userArr  = [
    {
        username: "IsaacWeir",
        email: "isaac@test.com",
        password: "test"
    },
    {
        username: "pops",
        email: "pops@test.com",
        password: "test"
    },
    {
        username: "NatalieHamm",
        email: "natalie@test.com",
        password: "test"
    },
    {
        username: "LandonValley",
        email: "landon@test.com",
        password: "test"
    },
    {
        username: "SaraFrazier",
        email: "sara@test.com",
        password: "test"
    },
    {
        username: "TylerMojo",
        email: "tyler@test.com",
        password: "test"
    },
    {
        username: "SethKiser",
        email: "seth@test.com",
        password: "test"
    }
]

const createUsers = async () => {
    // Create a loop where each user will be created
    userArr.forEach(async user => {
        let idCode = Math.floor((Math.random() * 99999) + 10000);
        idCode = Number(idCode.toString().substring(0, 5))

        let {username, email, password} = user;
        password = await bcrypt.hashSync(password, 10);
        let userToCreate = {
            uuid: await uuidv4(),
            username,
            email,
            password,
            idCode,
            backgroundColor: await colorGenerator.generate()
        }
        console.log(userToCreate)
        let createdUser = await User.create(userToCreate);
        if (createdUser.username) {
            console.log('user created')
        } else {
            console.log('error creating user')
        }
    })
}

module.exports = {createUsers}