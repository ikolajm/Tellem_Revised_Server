const Sequelize = require("sequelize");

// Initialize postgres connection
// If on local server ssl is not required, if being hosted somewhere, require ssl
let dialectOpt = process.env.DATABASE_URL.includes("localhost") ? "" : {
    ssl: {
        require: true, // This will help you. But you will see new error
        rejectUnauthorized: false // This line will fix new error
    }
}
const sequelize = new Sequelize(`${process.env.DATABASE_URL}`, {
    dialect: "postgres",
    dialectOptions: dialectOpt,
    // UNCOMMENT LOGGING FOR CLEANER JEST TESTING **
    // logging: false
});

// Authenticate postgres connection
sequelize.authenticate()
// COMMENT OUT PROMISE CODE WHEN JEST TESTING **
.then(() => console.log('Successful connection to postgres database...'))
.catch(err => console.log('POSTGRES CONNECTION FAILURE:', err));

// db Object init
const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require("./models/User")(sequelize, Sequelize);
db.Conversation = require("./models/Conversation")(sequelize, Sequelize);
db.Message = require("./models/Message")(sequelize, Sequelize);
db.Friend = require("./models/Friend")(sequelize, Sequelize);
db.FriendRequest = require("./models/FriendRequest")(sequelize, Sequelize);
db.UserConversation = require("./models/UserConversation")(sequelize, Sequelize);
db.UserConversationArchive = require("./models/UserConversationArchive")(sequelize, Sequelize);

// Associations
db.User.hasMany(db.Message)
db.Message.belongsTo(db.User, { foreignKey: "author" });
db.Conversation.hasMany(db.Message);
db.Message.belongsTo(db.Conversation);
db.User.hasMany(db.Friend);
db.Friend.belongsTo(db.User);
db.FriendRequest.belongsTo(db.User, { foreignKey: "authorId" });
db.User.hasMany(db.FriendRequest)

module.exports = db;