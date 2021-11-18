const Message = require("../../db").Message;
const Conversation = require("../../db").Conversation;
const User = require("../../db").User;
const UserConversation = require("../../db").UserConversation;
const moment = require("moment");
const { Op } = require("sequelize");

const formatConversations = async userConversations => {
    // Get all conversationInstances to search in array
    let conversationIds = [];
    userConversations.forEach(instance => {
        conversationIds.push(instance.conversationId)
    })

    let conversations = await Conversation.findAll({
        where: { id: { [Op.in]: conversationIds } },
        order: [[ 'createdAt', 'DESC' ]],
        include: [
            {
                model: Message,
                limit: 1,
                order: [ [ 'createdAt', 'DESC' ]],
                include: [
                    {
                        model: User,
                        attributes: ["uuid", "username"]
                    }
                ]
            }
        ]
    })

    // Get conversationIds, search for all users conversations
    let allUsersInvolved = await UserConversation.findAll({
        where: { conversationId: { [Op.in]: conversationIds} }
    })
    // Push all users to their respective conversations under a "users" array key, send their ids to an array
    let allUserIds = [];
    conversations.forEach(conversation => {
        let relevant = allUsersInvolved.filter(obj => obj.conversationId === conversation.id);
        relevant.forEach(obj => {
            allUserIds.push(obj.userId);
        })
        conversation.dataValues.users = relevant
    })
    // Create a copy with no duplicates
    allUserIds = [...new Set(allUserIds)];
    // Search for all users in id array
    let tempUsers = await User.findAll({
        where: { id: { [Op.in]: allUserIds } }
    })

    // Run a loop to push user objects into their conversations and respective place where ids match
    conversations.forEach(conversation => {
        let users = conversation.dataValues.users
        let temp = [];
        users.forEach(UserConversation => {
            UserConversation = UserConversation.dataValues;
            let item = tempUsers.find(user => user.dataValues.id === UserConversation.userId);
            temp.push(item);
        });
        // Format temp array to become normal object containing array
        let userArray = [];
        temp.forEach(dataObj => {
            userArray.push(dataObj.dataValues)
        })
        conversation.dataValues.users = userArray;
    })

    // Sort conversations by their last received message timestamp
    const sortedConversations = conversations.sort((a, b) => moment(b.messages[0].createdAt).format("x") - moment(a.messages[0].createdAt).format("x"))

    return sortedConversations;
}

module.exports = {formatConversations}