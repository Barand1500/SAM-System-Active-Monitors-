const jwt = require("jsonwebtoken");
const { User } = require("../models");

async function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer token

  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) return res.status(401).json({ error: "User not found" });

    // Convert to plain object and add snake_case aliases
    // Models use camelCase attributes (companyId) but code uses snake_case (company_id)
    const userData = user.toJSON();
    userData.company_id = userData.companyId || decoded.company_id; //Burayi değiştirdim çünkü token'da snake_case var ama modelde camelCase
    
    // Debug logging
    if (!userData.company_id) {
      console.error("[AUTH] Missing company_id for user:", {
        userId: decoded.id,
        userCompanyId: userData.companyId,
        decodedCompanyId: decoded.company_id,
        userData: { id: userData.id, email: userData.email }
      });
    }
    
    delete userData.password;
    req.user = userData;
    next();
  } catch (err) {
    console.error("[AUTH] Token verification error:", err.message);
    return res.status(403).json({ error: "Invalid token" });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}

module.exports = { authenticate, authorizeRoles };