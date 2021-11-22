require("dotenv").config();
const express = require('express')
const app = express();
const port = 5000;
const seedUsers = require('./seed/data/seedUsers');
const seedFriends = require('./seed/data/seedFriends');
const seedRequests = require('./seed/data/seedRequests');
const seedConversations = require('./seed/data/seedConversation');
const seedMessages = require('./seed/data/seedMessages');
const cors = require('cors')

app.use(cors())
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
      },
});
io.on('connection', (socket) => {
    // Join Room
    // console.log(socket)
    const { roomId } = socket.handshake.query;
    socket.join(roomId);
    console.log('a user connected');

    // New message
    socket.on("NEW_MESSAGE", (data) => {
        console.log("new message")
        io.in(roomId).emit("NEW_MESSAGE", data);
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log("user disconnected")
        socket.leave(roomId);
    });
});

// Body parser replacement
app.use(express.json());

const sequelize =  require('./db').sequelize;
sequelize.sync();

app.use(require("./middleware/headers"));

const UserOpen = require("./controllers/user/userOpen");
app.use("/user", UserOpen);
// Closed Routes
const UserProtected = require("./controllers/user/userProtected");
const Conversation = require("./controllers/conversation/conversation");
const Friend = require("./controllers/friend/friend");
const Request = require("./controllers/friend/request");
const Message = require("./controllers/message/message");
app.use(require("./middleware/validate-session"));
app.use("/friend", Friend);
app.use("/friend", Request);
app.use("/user", UserProtected);
app.use("/conversation", Conversation);
app.use("/message", Message);

// Seed data to db
// seedUsers.createUsers();
// seedFriends.createFriendships();
// seedRequests.createRequests();
// seedConversations.createConversations();
// seedMessages.createMessages();

http.listen(port, () => console.log(`App is listening on port ${port}`));