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

    // Convert to plain object and standardize all fields
    const userData = user.toJSON();
    
    // Ensure both camelCase and snake_case versions exist for compatibility
    userData.company_id = userData.companyId || decoded.company_id;
    userData.companyId = userData.companyId || decoded.company_id;
    
    // Validate company_id exists (CRITICAL for all operations)
    if (!userData.company_id && !userData.companyId) {
      console.error("[AUTH] CRITICAL: Missing company_id for user:", {
        userId: decoded.id,
        userCompanyId: userData.companyId,
        decodedCompanyId: decoded.company_id,
        tokenData: decoded
      });
      return res.status(401).json({ error: "User company assignment error" });
    }
    
    delete userData.password;
    req.user = userData;
    next();
  } catch (err) {
    console.error("[AUTH] Token verification error:", err.message);
    // Token geçersizse 401 dön (authentication hatası)
    return res.status(401).json({ error: "Invalid token" });
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