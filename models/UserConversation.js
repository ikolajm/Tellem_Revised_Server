module.exports = (sequelize, DataTypes) => {
    const UserConversations = sequelize.define("UserConversation", {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        conversationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    });
    return UserConversations;
}