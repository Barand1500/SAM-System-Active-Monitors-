const reportRepo = require("../repositories/ReportRepository");
const { Attendance, Break, User } = require("../models");
const { Op } = require("sequelize");

class ReportService {
  async getTaskReport(company_id) {
    return reportRepo.getTaskCountsByStatus(company_id);
  }

  async getAttendanceReport(company_id, startDate, endDate) {
    return reportRepo.getAttendanceSummary(company_id, startDate, endDate);
  }

  async getLeaveReport(company_id) {
    return reportRepo.getLeaveRequestCounts(company_id);
  }

  async getWeeklyTrend(company_id) {
    return reportRepo.getWeeklyTaskTrend(company_id);
  }

  async getTaskTrends(company_id) {
    return reportRepo.getTaskTrends(company_id);
  }

  async getUserAttendanceReport(userId, companyId, startDate, endDate) {
    // Tarih aralığı belirle (varsayılan: son 30 gün)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Kullanıcı doğrulama
    const user = await User.findOne({
      where: { id: userId, company_id: companyId }
    });

    if (!user) {
      throw new Error("Kullanıcı bulunamadı veya yetkisiz erişim");
    }

    // Mesai kayıtlarını çek
    const attendances = await Attendance.findAll({
      where: {
        user_id: userId,
        check_in: {
          [Op.between]: [start, end]
        }
      },
      include: [{
        model: Break,
        as: 'breaks'
      }],
      order: [['check_in', 'DESC']]
    });

    // İstatistikleri hesapla
    let totalWorkSeconds = 0;
    let totalBreakSeconds = 0;
    let totalDays = 0;
    let onTimeDays = 0;
    let lateDays = 0;

    const workStartHour = 9; // Mesai başlangıcı: 09:00

    attendances.forEach(att => {
      if (att.checkOut) {
        totalDays++;
        const checkIn = new Date(att.checkIn);
        const checkOut = new Date(att.checkOut);
        const workSeconds = Math.floor((checkOut - checkIn) / 1000);
        totalWorkSeconds += workSeconds;

        // Geç kalma kontrolü (09:00'dan sonra geldi mi?)
        const checkInHour = checkIn.getHours();
        const checkInMinute = checkIn.getMinutes();
        if (checkInHour > workStartHour || (checkInHour === workStartHour && checkInMinute > 15)) {
          lateDays++;
        } else {
          onTimeDays++;
        }

        // Mola süreleri
        if (att.breaks && att.breaks.length > 0) {
          att.breaks.forEach(brk => {
            if (brk.endTime) {
              const breakStart = new Date(brk.startTime);
              const breakEnd = new Date(brk.endTime);
              totalBreakSeconds += Math.floor((breakEnd - breakStart) / 1000);
            }
          });
        }
      }
    });

    // Süreler format
    const formatDuration = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return { hours, minutes, text: `${hours}s ${minutes}dk` };
    };

    const avgWorkSeconds = totalDays > 0 ? totalWorkSeconds / totalDays : 0;
    const avgBreakSeconds = totalDays > 0 ? totalBreakSeconds / totalDays : 0;

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department
      },
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      stats: {
        totalDays,
        onTimeDays,
        lateDays,
        latePercent: totalDays > 0 ? Math.round((lateDays / totalDays) * 100) : 0,
        totalWorkTime: formatDuration(totalWorkSeconds),
        averageWorkTime: formatDuration(avgWorkSeconds),
        totalBreakTime: formatDuration(totalBreakSeconds),
        averageBreakTime: formatDuration(avgBreakSeconds)
      },
      attendances: attendances.map(att => ({
        id: att.id,
        date: att.checkIn,
        checkIn: att.checkIn,
        checkOut: att.checkOut,
        isLate: (() => {
          const checkIn = new Date(att.checkIn);
          const hour = checkIn.getHours();
          const minute = checkIn.getMinutes();
          return hour > workStartHour || (hour === workStartHour && minute > 15);
        })(),
        workDuration: att.checkOut ? formatDuration(Math.floor((new Date(att.checkOut) - new Date(att.checkIn)) / 1000)) : null,
        breakCount: att.breaks ? att.breaks.length : 0,
        breaks: att.breaks ? att.breaks.map(brk => ({
          id: brk.id,
          startTime: brk.startTime,
          endTime: brk.endTime,
          duration: brk.endTime ? formatDuration(Math.floor((new Date(brk.endTime) - new Date(brk.startTime)) / 1000)) : null
        })) : []
      }))
    };
  }
}

module.exports = new ReportService();
