// Şirket izolasyonu: kullanıcı sadece kendi şirketinin verilerine erişebilir
function companyIsolation(req, res, next) {
  if (!req.user || !req.user.company_id) {
    return res.status(403).json({ error: "Şirket izolasyonu: şirket kimliği eksik" });
  }

  // Sorgu parametrelerine veya body'ye company_id enjekte et
  // GET: query parametrelerine ekle
  if (req.method === "GET") {
    req.query.company_id = req.user.company_id;
  } 
  // HEAD: query parametrelerine ekle
  else if (req.method === "HEAD") {
    req.query.company_id = req.user.company_id;
  }
  // POST, PUT, PATCH, DELETE: body'ye ekle
  else {
    if (!req.body) req.body = {};
    req.body.company_id = req.user.company_id;
  }

  next();
}

module.exports = companyIsolation;
