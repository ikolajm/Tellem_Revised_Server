module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            isEmail: true,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        idCode: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        backgroundColor: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
    return User;
}