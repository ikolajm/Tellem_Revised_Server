module.exports = (sequelize, DataTypes) => {
    const Conversation = sequelize.define("conversations", {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        backgroundColor: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });
    return Conversation;
}