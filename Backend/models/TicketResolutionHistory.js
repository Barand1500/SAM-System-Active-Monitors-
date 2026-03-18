module.exports = (sequelize, DataTypes) => {
  const TicketResolutionHistory = sequelize.define("TicketResolutionHistory", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    ticketId: { type: DataTypes.BIGINT, allowNull: false, field: "ticket_id" },
    companyId: { type: DataTypes.BIGINT, allowNull: false, field: "company_id" },
    cycleNumber: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: "cycle_number" },
    resolvedBy: { type: DataTypes.BIGINT, field: "resolved_by" },
    resolution: { type: DataTypes.TEXT },
    resolvedAt: { type: DataTypes.DATE, field: "resolved_at" },
    reopenedBy: { type: DataTypes.BIGINT, field: "reopened_by" },
    reopenedAt: { type: DataTypes.DATE, field: "reopened_at" },
    reopenReason: { type: DataTypes.TEXT, field: "reopen_reason" },
    durationSeconds: { type: DataTypes.INTEGER, field: "duration_seconds", comment: "Oluşturulma/yeniden açılmadan çözüme kadar geçen süre (saniye)" }
  }, {
    tableName: "ticket_resolution_history",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });
  return TicketResolutionHistory;
};
