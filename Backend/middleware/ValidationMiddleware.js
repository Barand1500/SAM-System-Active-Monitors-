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
    body("title").trim().notEmpty().withMessage("Başlık zorunludur"),
    body("taskListId").optional({ nullable: true }).isInt({ min: 1 }).withMessage("Geçerli bir liste ID giriniz"),
    body("statusId").optional({ nullable: true }).isInt({ min: 1 }).withMessage("Geçerli bir durum ID giriniz"),
    body("priorityId").optional({ nullable: true }).isInt({ min: 1 }).withMessage("Geçerli bir öncelik ID giriniz")
  ],

  updateTask: [
    body("title").optional().trim().notEmpty().withMessage("Başlık boş olamaz"),
    body("statusId").optional().isInt({ min: 1 }).withMessage("Geçerli bir durum ID giriniz"),
    body("priorityId").optional().isInt({ min: 1 }).withMessage("Geçerli bir öncelik ID giriniz")
  ],

  assignUser: [
    body("user_id").isInt({ min: 1 }).withMessage("Geçerli bir kullanıcı ID giriniz")
  ],

  createUser: [
    body("firstName").trim().notEmpty().withMessage("Ad zorunludur"),
    body("lastName").trim().notEmpty().withMessage("Soyad zorunludur"),
    body("email").isEmail().withMessage("Geçerli bir e-posta giriniz"),
    body("password").isLength({ min: 6 }).withMessage("Şifre en az 6 karakter olmalıdır"),
    body("role").isIn(["boss", "manager", "employee", "customer"]).withMessage("Geçerli bir rol giriniz")
  ],

  login: [
    body("email").isEmail().withMessage("Geçerli bir e-posta giriniz"),
    body("password").notEmpty().withMessage("Şifre zorunludur")
  ],

  registerCompany: [
    body("company.name").trim().notEmpty().withMessage("Şirket adı zorunludur"),
    body("admin.firstName").trim().notEmpty().withMessage("Ad zorunludur"),
    body("admin.lastName").trim().notEmpty().withMessage("Soyad zorunludur"),
    body("admin.email").isEmail().withMessage("Geçerli bir e-posta giriniz"),
    body("admin.password").isLength({ min: 6 }).withMessage("Şifre en az 6 karakter olmalıdır")
  ],

  registerEmployee: [
    body("firstName").trim().notEmpty().withMessage("Ad zorunludur"),
    body("lastName").trim().notEmpty().withMessage("Soyad zorunludur"),
    body("email").isEmail().withMessage("Geçerli bir e-posta giriniz"),
    body("password").isLength({ min: 6 }).withMessage("Şifre en az 6 karakter olmalıdır")
  ],

  joinCompany: [
    body("company_code").trim().notEmpty().withMessage("Şirket kodu zorunludur"),
    body("firstName").trim().notEmpty().withMessage("Ad zorunludur"),
    body("lastName").trim().notEmpty().withMessage("Soyad zorunludur"),
    body("email").isEmail().withMessage("Geçerli bir e-posta giriniz"),
    body("password").isLength({ min: 6 }).withMessage("Şifre en az 6 karakter olmalıdır")
  ]
};

module.exports = { validate, rules };
