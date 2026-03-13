// Backend/controllers/BreakController.js
const BreakService = require("../services/BreakService");
const logger = require("../utils/logger");

class BreakController {
  async startBreak(req, res) {
    try {
      const { break_type_id } = req.body;
      logger.info('BREAK', 'Mola başlatılıyor', { userId: req.user.id, breakTypeId: break_type_id });
      
      if (!break_type_id) {
        logger.warning('BREAK', 'Break type ID eksik');
        return res.status(400).json({ error: 'break_type_id gereklidir' });
      }
      
      const br = await BreakService.startBreak(req.user.id, break_type_id);
      
      logger.success('BREAK', `Mola başlatıldı: #${br.id}`);
      res.status(201).json(br);
    } catch (err) {
      logger.error('BREAK', 'Mola başlatılırken hata', err);
      res.status(400).json({ error: err.message });
    }
  }

  async endBreak(req, res) {
    try {
      logger.info('BREAK', 'Mola sonlandırılıyor', { userId: req.user.id, breakId: req.params.breakId });
      
      const br = await BreakService.endBreak(req.user.id, req.params.breakId);
      
      logger.success('BREAK', `Mola sonlandırıldı: #${br.id}`);
      res.json(br);
    } catch (err) {
      logger.error('BREAK', 'Mola sonlandırılırken hata', err);
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new BreakController();