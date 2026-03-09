module.exports = (sequelize, DataTypes) => {
  const Break = sequelize.define("Break", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    attendanceId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "attendance_id"
    },

    breakTypeId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: "break_type_id"
    },

    startTime: {
      type: DataTypes.DATE,
      field: "start_time"
    },

    endTime: {
      type: DataTypes.DATE,
      field: "end_time"
    },

    isViolated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_violated"
    }

  }, {
    tableName: "breaks",
    timestamps: true,
    underscored: true
  });

  return Break;
};