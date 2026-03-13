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
      if (att.check_out) {
        totalDays++;
        const checkIn = new Date(att.check_in);
        const checkOut = new Date(att.check_out);
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
            if (brk.end_time) {
              const breakStart = new Date(brk.start_time);
              const breakEnd = new Date(brk.end_time);
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
        firstName: user.first_name,
        lastName: user.last_name,
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
        date: att.check_in,
        checkIn: att.check_in,
        checkOut: att.check_out,
        isLate: (() => {
          const checkIn = new Date(att.check_in);
          const hour = checkIn.getHours();
          const minute = checkIn.getMinutes();
          return hour > workStartHour || (hour === workStartHour && minute > 15);
        })(),
        workDuration: att.check_out ? formatDuration(Math.floor((new Date(att.check_out) - new Date(att.check_in)) / 1000)) : null,
        breakCount: att.breaks ? att.breaks.length : 0,
        breaks: att.breaks ? att.breaks.map(brk => ({
          id: brk.id,
          startTime: brk.start_time,
          endTime: brk.end_time,
          duration: brk.end_time ? formatDuration(Math.floor((new Date(brk.end_time) - new Date(brk.start_time)) / 1000)) : null
        })) : []
      }))
    };
  }
}

module.exports = new ReportService();
