module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define("message", {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        hidden: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        edited: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    });
    return Message;
}