module.exports = (sequelize, DataTypes) => {
    const UserConversationsArchive = sequelize.define("UserConversationArchive", {
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
    return UserConversationsArchive;
}