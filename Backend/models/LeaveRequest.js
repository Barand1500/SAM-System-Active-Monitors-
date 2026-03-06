module.exports = (sequelize, DataTypes) => {
  const LeaveRequest = sequelize.define("LeaveRequest", {

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

    leaveType: {
      type: DataTypes.ENUM("annual","sick","personal","unpaid","education"),
      allowNull: false,
      field: "leave_type"
    },

    startDate: {
      type: DataTypes.DATEONLY,
      field: "start_date"
    },

    endDate: {
      type: DataTypes.DATEONLY,
      field: "end_date"
    },

    leaveDays: {
      type: DataTypes.INTEGER,
      field: "leave_days"
    },

    reasonText: {
      type: DataTypes.TEXT,
      field: "reason_text"
    },

    documentUrl: {
      type: DataTypes.STRING(500),
      field: "document_url"
    },

    approvalStatus: {
      type: DataTypes.ENUM("pending","approved","rejected"),
      defaultValue: "pending",
      field: "approval_status"
    },

    approvedBy: {
      type: DataTypes.BIGINT,
      field: "approved_by"
    },

    approvedAt: {
      type: DataTypes.DATE,
      field: "approved_at"
    },

    rejectionReason: {
      type: DataTypes.TEXT,
      field: "rejection_reason"
    }

  }, {
    tableName: "leave_requests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return LeaveRequest;
};