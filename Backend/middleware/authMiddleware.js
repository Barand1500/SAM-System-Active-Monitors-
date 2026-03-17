const jwt = require("jsonwebtoken");
const { User } = require("../models");

async function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer token

  if (!token) {
    return res.status(401).json({
      code: "AUTH_TOKEN_MISSING",
      error: "Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        code: "AUTH_USER_NOT_FOUND",
        error: "Kullanıcı bulunamadı. Lütfen tekrar giriş yapın."
      });
    }

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
      return res.status(401).json({
        code: "AUTH_COMPANY_MISSING",
        error: "Kullanıcı şirket bilgisi eksik. Yönetici ile iletişime geçin."
      });
    }
    
    delete userData.password;
    req.user = userData;
    next();
  } catch (err) {
    console.error("[AUTH] Token verification error:", err.message);
    // Token geçersizse 401 dön (authentication hatası)
    return res.status(401).json({
      code: "AUTH_TOKEN_INVALID",
      error: "Oturum süresi dolmuş veya geçersiz. Lütfen yeniden giriş yapın."
    });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: "AUTH_UNAUTHORIZED",
        error: "Bu işlem için giriş yapmanız gerekiyor."
      });
    }
    // Hem ENUM role hem de custom roles dizisini kontrol et
    const userRole = req.user.role;
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];
    
    const hasAccess = roles.includes(userRole) || userRoles.some(r => roles.includes(r));
    
    if (!hasAccess) {
      return res.status(403).json({
        code: "AUTH_FORBIDDEN",
        error: "Bu işlemi yapma yetkiniz bulunmuyor."
      });
    }
    next();
  };
}

module.exports = { authenticate, authorizeRoles };