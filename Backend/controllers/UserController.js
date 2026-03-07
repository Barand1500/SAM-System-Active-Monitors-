// Backend/controllers/UserController.js
const UserService = require("../services/UserService");

class UserController {
  async list(req, res) {
    try {
      const users = await UserService.listByCompany(req.user.company_id);
      res.json(users);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body, req.user.company_id);
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const user = await UserService.getUserWithSkills(req.params.id, req.user.company_id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await UserService.deleteUser(req.params.id, req.user.company_id);
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new UserController();