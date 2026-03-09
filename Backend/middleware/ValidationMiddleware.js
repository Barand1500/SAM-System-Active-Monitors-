const { validationResult, body, param, query } = require("express-validator");

// Validation sonuçlarını kontrol eden middleware
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

// Sık kullanılan validation kuralları
const rules = {
  idParam: [
    param("id").isInt({ min: 1 }).withMessage("Geçerli bir ID giriniz")
  ],

  createTask: [
    body("title").notEmpty().withMessage("Başlık zorunludur"),
    body("taskListId").isInt({ min: 1 }).withMessage("Geçerli bir liste ID giriniz"),
    body("statusId").isInt({ min: 1 }).withMessage("Geçerli bir durum ID giriniz"),
    body("priorityId").isInt({ min: 1 }).withMessage("Geçerli bir öncelik ID giriniz")
  ],

  login: [
    body("email").isEmail().withMessage("Geçerli bir e-posta giriniz"),
    body("password").notEmpty().withMessage("Şifre zorunludur")
  ],

  registerCompany: [
    body("company.name").notEmpty().withMessage("Şirket adı zorunludur"),
    body("admin.firstName").notEmpty().withMessage("Ad zorunludur"),
    body("admin.lastName").notEmpty().withMessage("Soyad zorunludur"),
    body("admin.email").isEmail().withMessage("Geçerli bir e-posta giriniz"),
    body("admin.password").isLength({ min: 6 }).withMessage("Şifre en az 6 karakter olmalıdır")
  ]
};

module.exports = { validate, rules };
