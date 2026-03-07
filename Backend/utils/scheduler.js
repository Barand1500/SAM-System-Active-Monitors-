const { RecurringTask, Task, TaskStatus } = require("../models");
const { Op } = require("sequelize");
const logger = require("./logger");

function calculateNextRun(task) {
  const now = new Date();
  let next = new Date(now);

  if (task.timeOfDay) {
    const [h, m, s] = task.timeOfDay.split(":").map(Number);
    next.setHours(h, m, s || 0, 0);
  }

  switch (task.frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      if (task.dayOfMonth) next.setDate(task.dayOfMonth);
      break;
    default:
      next.setDate(next.getDate() + 1);
  }

  return next;
}

async function processRecurringTasks() {
  try {
    const now = new Date();
    const dueTasks = await RecurringTask.findAll({
      where: {
        isActive: true,
        nextRunAt: { [Op.lte]: now },
      },
    });

    if (dueTasks.length === 0) return;

    logger.info(`Scheduler: ${dueTasks.length} recurring task(s) to process`);

    // Get default status for new tasks (first available status)
    let defaultStatusId = null;
    try {
      const defaultStatus = await TaskStatus.findOne({ order: [["id", "ASC"]] });
      if (defaultStatus) defaultStatusId = defaultStatus.id;
    } catch {
      // TaskStatus table may not exist yet
    }

    for (const rt of dueTasks) {
      try {
        // Create a new Task from the recurring template
        await Task.create({
          taskListId: rt.taskListId,
          companyId: rt.companyId,
          creatorId: rt.createdBy,
          title: rt.title,
          description: rt.description,
          priorityId: rt.priorityId,
          statusId: defaultStatusId || 1,
          dueDate: new Date().toISOString().split("T")[0],
        });

        // Update last_run and next_run
        rt.lastRunAt = now;
        rt.nextRunAt = calculateNextRun(rt);
        await rt.save();

        logger.info(`Scheduler: Created task from recurring template #${rt.id} "${rt.title}"`);
      } catch (err) {
        logger.error(`Scheduler: Error processing recurring task #${rt.id}: ${err.message}`);
      }
    }
  } catch (err) {
    logger.error(`Scheduler: Error in processRecurringTasks: ${err.message}`);
  }
}

let intervalId = null;

function startScheduler(intervalMs = 60000) {
  if (intervalId) return;
  logger.info(`Scheduler started (interval: ${intervalMs / 1000}s)`);
  // Run once immediately, then at interval
  processRecurringTasks();
  intervalId = setInterval(processRecurringTasks, intervalMs);
}

function stopScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info("Scheduler stopped");
  }
}

module.exports = { startScheduler, stopScheduler, processRecurringTasks, calculateNextRun };
