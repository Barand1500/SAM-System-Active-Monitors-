module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define("Attendance", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "user_id"
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },

    checkIn: {
      type: DataTypes.DATE,
      field: "check_in"
    },

    checkOut: {
      type: DataTypes.DATE,
      field: "check_out"
    },

    ipAddress: {
      type: DataTypes.STRING(45),
      field: "ip_address"
    },

    device: DataTypes.STRING(255),

    note: DataTypes.TEXT

  }, {
    tableName: "attendance",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return Attendance;
};