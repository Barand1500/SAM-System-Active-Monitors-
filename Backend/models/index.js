const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// MODELLER
const Company = require("./Company")(sequelize, DataTypes);
const Department = require("./Department")(sequelize, DataTypes);
const User = require("./User")(sequelize, DataTypes);

const TaskStatus = require("./TaskStatus")(sequelize, DataTypes);
const TaskPriority = require("./TaskPriority")(sequelize, DataTypes);
const Category = require("./Category")(sequelize, DataTypes);
const Tag = require("./Tag")(sequelize, DataTypes);

const Workspace = require("./Workspace")(sequelize, DataTypes);
const WorkspaceMember = require("./WorkspaceMember")(sequelize, DataTypes);

const Project = require("./Project")(sequelize, DataTypes);
const ProjectMember = require("./ProjectMember")(sequelize, DataTypes);

const TaskList = require("./TaskList")(sequelize, DataTypes);
const Task = require("./Task")(sequelize, DataTypes);
const TaskAssignment = require("./TaskAssignment")(sequelize, DataTypes);
const TaskTag = require("./TaskTag")(sequelize, DataTypes);

const TaskComment = require("./TaskComment")(sequelize, DataTypes);
const TaskLog = require("./TaskLog")(sequelize, DataTypes);
const TaskHistory = require("./TaskHistory")(sequelize, DataTypes);

const File = require("./File")(sequelize, DataTypes);
const TaskFile = require("./TaskFile")(sequelize, DataTypes);
const CommentFile = require("./CommentFile")(sequelize, DataTypes);

const Attendance = require("./Attendance")(sequelize, DataTypes);
const BreakType = require("./BreakType")(sequelize, DataTypes);
const Break = require("./Break")(sequelize, DataTypes);

const LeaveRequest = require("./LeaveRequest")(sequelize, DataTypes);

const Notification = require("./Notification")(sequelize, DataTypes);
const Announcement = require("./Announcement")(sequelize, DataTypes);
const CompanySetting = require("./CompanySetting")(sequelize, DataTypes);

const AutomationRule = require("./AutomationRule")(sequelize, DataTypes);
const RecurringTask = require("./RecurringTask")(sequelize, DataTypes);

const UserDashboardSetting = require("./UserDashboardSetting")(sequelize, DataTypes);
const AuditLog = require("./AuditLog")(sequelize, DataTypes);
const UserSkill = require("./UserSkill")(sequelize, DataTypes);


// ============================
// RELATIONSHIPS
// ============================

// COMPANY
Company.hasMany(User, { foreignKey: "company_id" });
User.belongsTo(Company, { foreignKey: "company_id" });

Company.hasMany(Department, { foreignKey: "company_id" });
Department.belongsTo(Company, { foreignKey: "company_id" });


// TASK
Task.belongsTo(TaskList, { foreignKey: "task_list_id" });
TaskList.hasMany(Task, { foreignKey: "task_list_id" });

Task.belongsTo(User, { foreignKey: "creator_id", as: "creator" });

Task.belongsTo(TaskStatus, { foreignKey: "status_id" });
Task.belongsTo(TaskPriority, { foreignKey: "priority_id" });

Task.belongsTo(Category, { foreignKey: "category_id" });


// TASK ASSIGNMENTS
TaskAssignment.belongsTo(Task, { foreignKey: "task_id" });
Task.hasMany(TaskAssignment, { foreignKey: "task_id" });

TaskAssignment.belongsTo(User, { foreignKey: "user_id" });


// TASK TAGS
TaskTag.belongsTo(Task, { foreignKey: "task_id" });
TaskTag.belongsTo(Tag, { foreignKey: "tag_id" });

Task.belongsToMany(Tag, {
    through: TaskTag,
    foreignKey: "task_id"
});

Tag.belongsToMany(Task, {
    through: TaskTag,
    foreignKey: "tag_id"
});


// COMMENTS
TaskComment.belongsTo(Task, { foreignKey: "task_id" });
Task.hasMany(TaskComment, { foreignKey: "task_id" });

TaskComment.belongsTo(User, { foreignKey: "user_id" });


// FILES
File.belongsTo(User, { foreignKey: "uploaded_by" });

TaskFile.belongsTo(Task, { foreignKey: "task_id" });
TaskFile.belongsTo(File, { foreignKey: "file_id" });

CommentFile.belongsTo(TaskComment, { foreignKey: "comment_id" });
CommentFile.belongsTo(File, { foreignKey: "file_id" });


// ATTENDANCE
Attendance.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Attendance, { foreignKey: "user_id" });

Break.belongsTo(Attendance, { foreignKey: "attendance_id" });
Break.belongsTo(BreakType, { foreignKey: "break_type_id" });


// LEAVE
LeaveRequest.belongsTo(User, { foreignKey: "user_id" });


// NOTIFICATIONS
Notification.belongsTo(User, { foreignKey: "user_id" });


// ANNOUNCEMENTS
Announcement.belongsTo(User, { foreignKey: "user_id" });
Announcement.belongsTo(Company, { foreignKey: "company_id" });


// SETTINGS
CompanySetting.belongsTo(Company, { foreignKey: "company_id" });


// WORKSPACE
Workspace.belongsTo(Company, { foreignKey: "company_id" });
Company.hasMany(Workspace, { foreignKey: "company_id" });

Workspace.belongsTo(User, { foreignKey: "created_by", as: "workspaceCreator" });

WorkspaceMember.belongsTo(Workspace, { foreignKey: "workspace_id" });
Workspace.hasMany(WorkspaceMember, { foreignKey: "workspace_id" });

WorkspaceMember.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(WorkspaceMember, { foreignKey: "user_id" });


// PROJECT
Project.belongsTo(Workspace, { foreignKey: "workspace_id" });
Workspace.hasMany(Project, { foreignKey: "workspace_id" });

Project.belongsTo(User, { foreignKey: "created_by", as: "projectCreator" });

ProjectMember.belongsTo(Project, { foreignKey: "project_id" });
Project.hasMany(ProjectMember, { foreignKey: "project_id" });

ProjectMember.belongsTo(User, { foreignKey: "user_id" });


// TASK LIST
TaskList.belongsTo(Project, { foreignKey: "project_id" });
Project.hasMany(TaskList, { foreignKey: "project_id" });


// AUTOMATION
AutomationRule.belongsTo(Company, { foreignKey: "company_id" });


// USER SKILLS
UserSkill.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(UserSkill, { foreignKey: "user_id" });


// RECURRING TASK
RecurringTask.belongsTo(User, { foreignKey: "created_by" });
RecurringTask.belongsTo(TaskPriority, { foreignKey: "priority_id" });


// DASHBOARD
UserDashboardSetting.belongsTo(User, { foreignKey: "user_id" });


// AUDIT
AuditLog.belongsTo(User, { foreignKey: "user_id" });


// EXPORT
module.exports = {
  sequelize,
  Sequelize,

  Company,
  Department,
  User,

  TaskStatus,
  TaskPriority,
  Category,
  Tag,

  Workspace,
  WorkspaceMember,

  Project,
  ProjectMember,

  TaskList,
  Task,
  TaskAssignment,
  TaskTag,

  TaskComment,
  TaskLog,
  TaskHistory,

  File,
  TaskFile,
  CommentFile,

  Attendance,
  BreakType,
  Break,

  LeaveRequest,

  Notification,
  Announcement,
  CompanySetting,

  AutomationRule,
  RecurringTask,

  UserDashboardSetting,
  AuditLog,
  UserSkill
};