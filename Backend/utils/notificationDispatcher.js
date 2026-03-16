const { Notification, User } = require("../models");

const toPlainNotification = (record) => ({
  id: record.id,
  userId: record.userId,
  title: record.title,
  content: record.message,
  message: record.message,
  type: record.type || "info",
  referenceType: record.referenceType || null,
  referenceId: record.referenceId || null,
  isRead: record.isRead || false,
  createdAt: record.createdAt,
});

const emitToUsers = (req, userIds, payload) => {
  const io = req.app.get("io");
  if (!io) return;

  userIds.forEach((userId) => {
    io.to(`user_${userId}`).emit("user:notification", payload);
  });
};

const createForUsers = async (req, userIds, data) => {
  const uniqueUserIds = [...new Set((userIds || []).filter(Boolean).map((id) => Number(id)))];
  if (uniqueUserIds.length === 0) return [];

  const rows = uniqueUserIds.map((userId) => ({
    userId,
    title: data.title,
    message: data.message,
    type: data.type || "info",
    referenceType: data.referenceType || null,
    referenceId: data.referenceId || null,
    isRead: false,
  }));

  const created = await Notification.bulkCreate(rows);
  const payloadByUser = new Map();

  created.forEach((item) => {
    payloadByUser.set(Number(item.userId), toPlainNotification(item));
  });

  uniqueUserIds.forEach((userId) => {
    const payload = payloadByUser.get(Number(userId));
    if (payload) {
      emitToUsers(req, [userId], payload);
    }
  });

  return created;
};

const createForCompany = async (req, options) => {
  const companyId = options.companyId || req.user?.company_id || req.user?.companyId;
  if (!companyId) return [];

  const users = await User.findAll({
    where: { companyId },
    attributes: ["id"],
  });

  let userIds = users.map((u) => Number(u.id));

  if (options.excludeUserId) {
    userIds = userIds.filter((id) => Number(id) !== Number(options.excludeUserId));
  }

  return createForUsers(req, userIds, options);
};

module.exports = {
  createForUsers,
  createForCompany,
};
