const sequelize = require("../db");

module.exports = (sequelize, DataTypes) => {
    const FriendRequests = sequelize.define("friend_requests", {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userTo: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return FriendRequests;
}