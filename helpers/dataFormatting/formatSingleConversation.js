const Message = require("../../db").Message;
const Conversation = require("../../db").Conversation;
const User = require("../../db").User;
const UserConversation = require("../../db").UserConversation;
const moment = require("moment");
const { Op } = require("sequelize");

const formatSingle = async (conversation) => {
    // Get conversation information
    let foundConversation = await Conversation.findOne({
        where: { id: conversation.conversationId }
    })

    // foundConversation.dataValues.background = colorGen();
    
    // Get conversationId, search for all UserConversation instances
    let allUserInstances = await UserConversation.findAll({
        where: { conversationId: conversation.conversationId }
    })

    // Get all users for this conversation
    let userIds = [];
    allUserInstances.forEach(instance => {
        userIds.push(instance.userId);
    })
    let allUsers = await User.findAll({
        where: { id: { [Op.in]: userIds }}
    })

    // Get first set of messages for conversation with their respective authors
    let messages = await Message.findAll({
        where: { conversationId: conversation.conversationId },
        order: [["createdAt", "DESC"]],
        // limit,
        // offset,
        include: [
            {
                model: User
            }
        ]
    })
    
    // =============================
    let sortedMessages = []
    let messageArray = []
    let compareDate = ""
    // Group previous messages by date sent
    messages.forEach((message, index) => {
        // Cut off createdAt to show YEAR-MONTH-DAY
        let created = moment(message.createdAt).format("L")
        // If starting function, set compareDate
        if (index === 0) { compareDate = created }
        // See if dates compare
        if (compareDate === created) {
            messageArray.push(message)
            if (index === messages.length - 1) {
                messageArray.reverse()
                sortedMessages.push({date: compareDate, messages: messageArray})
            }
        } else {
            messageArray.reverse()
            sortedMessages.push({date: moment(messageArray[0].createdAt).format("L"), messages: messageArray})
            compareDate = created
            messageArray = [message]
            if (index === messages.length - 1) {
                sortedMessages.push({date: compareDate, messages: messageArray})
            }
        }
    })
    // Reverse order to account for the styling within the dashboard (reverse scroll feed)
    sortedMessages.reverse()
    // =============================

    let obj = {
        conversation: foundConversation,
        users: allUsers,
        messages: sortedMessages
    }
    return obj;
}

module.exports = {formatSingle};