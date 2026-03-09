module.exports = (sequelize, DataTypes) => {
  const TicketMessage = sequelize.define("TicketMessage", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    ticketId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "ticket_id"
    },

    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "user_id"
    },

    messageText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "message_text"
    },

    isInternal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_internal"
    }

  }, {
    tableName: "ticket_messages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return TicketMessage;
};
