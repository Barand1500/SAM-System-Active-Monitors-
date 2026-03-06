const DepartmentService = require("../services/DepartmentService");

class DepartmentController {
  async list(req, res) {
    try {
      const departments = await DepartmentService.getByCompany(req.user.company_id);
      res.json(departments);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const department = await DepartmentService.getById(req.params.id);
      if (!department) return res.status(404).json({ error: "Department not found" });
      res.json(department);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const department = await DepartmentService.create({
        ...req.body,
        company_id: req.user.company_id
      });
      res.status(201).json(department);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const department = await DepartmentService.update(req.params.id, req.body);
      res.json(department);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await DepartmentService.delete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new DepartmentController();
