// Rol bazlı yetkilendirme middleware
// authMiddleware.js'deki authorizeRoles ile aynı işlev - ek granüler kontrol için
function roleCheck(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }

    next();
  };
}

module.exports = roleCheck;
