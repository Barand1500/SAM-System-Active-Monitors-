// Şirket izolasyonu: kullanıcı sadece kendi şirketinin verilerine erişebilir
function companyIsolation(req, res, next) {
  if (!req.user || !req.user.company_id) {
    return res.status(403).json({ error: "Company isolation: company_id missing" });
  }

  // Sorgu parametrelerine veya body'ye company_id enjekte et
  if (req.method === "GET") {
    req.query.company_id = req.user.company_id;
  } else {
    req.body.company_id = req.user.company_id;
  }

  next();
}

module.exports = companyIsolation;
