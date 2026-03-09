const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// MODELLER
const Company = require("./Company")(sequelize, DataTypes);
const Department = require("./Department")(sequelize, DataTypes);
const User = require("./User")(sequelize, DataTypes);
const Customer = require("./Customer")(sequelize, DataTypes);

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

const Survey = require("./Survey")(sequelize, DataTypes);
const SurveyQuestion = require("./SurveyQuestion")(sequelize, DataTypes);
const SurveyQuestionOption = require("./SurveyQuestionOption")(sequelize, DataTypes);
const SurveyResponse = require("./SurveyResponse")(sequelize, DataTypes);
const SurveyAnswer = require("./SurveyAnswer")(sequelize, DataTypes);

const SupportTicket = require("./SupportTicket")(sequelize, DataTypes);
const TicketMessage = require("./TicketMessage")(sequelize, DataTypes);
const TicketFile = require("./TicketFile")(sequelize, DataTypes);
const TicketCategory = require("./TicketCategory")(sequelize, DataTypes);


// ============================
// RELATIONSHIPS
// ============================

// COMPANY
Company.hasMany(User, { foreignKey: "company_id" });
User.belongsTo(Company, { foreignKey: "company_id" });

Company.hasMany(Department, { foreignKey: "company_id" });
Department.belongsTo(Company, { foreignKey: "company_id" });

// USER → DEPARTMENT
User.belongsTo(Department, { foreignKey: "department_id" });
Department.hasMany(User, { foreignKey: "department_id" });


// TASK
Task.belongsTo(TaskList, { foreignKey: "task_list_id" });
TaskList.hasMany(Task, { foreignKey: "task_list_id" });

Task.belongsTo(User, { foreignKey: "creator_id", as: "creator" });

Task.belongsTo(TaskStatus, { foreignKey: "status_id" });
Task.belongsTo(TaskPriority, { foreignKey: "priority_id" });

Task.belongsTo(Category, { foreignKey: "category_id" });

// TASK SELF-REFERENCING (alt görevler)
Task.belongsTo(Task, { as: "parentTask", foreignKey: "parent_task_id" });
Task.hasMany(Task, { as: "subtasks", foreignKey: "parent_task_id" });


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

// COMMENT SELF-REFERENCING (threaded yanıtlar)
TaskComment.belongsTo(TaskComment, { as: "parentComment", foreignKey: "parent_comment_id" });
TaskComment.hasMany(TaskComment, { as: "replies", foreignKey: "parent_comment_id" });


// TASK LOG
TaskLog.belongsTo(Task, { foreignKey: "task_id" });
Task.hasMany(TaskLog, { foreignKey: "task_id" });

TaskLog.belongsTo(User, { foreignKey: "user_id" });


// TASK HISTORY
TaskHistory.belongsTo(Task, { foreignKey: "task_id" });
Task.hasMany(TaskHistory, { foreignKey: "task_id" });

TaskHistory.belongsTo(User, { foreignKey: "user_id", as: "changedBy" });


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
LeaveRequest.belongsTo(User, { as: "approver", foreignKey: "approved_by" });


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
RecurringTask.belongsTo(User, { as: "assignee", foreignKey: "assignee_id" });
RecurringTask.belongsTo(TaskPriority, { foreignKey: "priority_id" });
RecurringTask.belongsTo(TaskList, { foreignKey: "task_list_id" });


// DASHBOARD
UserDashboardSetting.belongsTo(User, { foreignKey: "user_id" });


// AUDIT
AuditLog.belongsTo(User, { foreignKey: "user_id" });


// CUSTOMER
Customer.belongsTo(User, { foreignKey: "user_id" });
User.hasOne(Customer, { foreignKey: "user_id" });


// SURVEY
Survey.belongsTo(Company, { foreignKey: "company_id" });
Company.hasMany(Survey, { foreignKey: "company_id" });

Survey.belongsTo(User, { foreignKey: "created_by", as: "creator" });

SurveyQuestion.belongsTo(Survey, { foreignKey: "survey_id" });
Survey.hasMany(SurveyQuestion, { foreignKey: "survey_id" });

SurveyQuestion.belongsTo(SurveyQuestion, { as: "parentQuestion", foreignKey: "conditional_parent_id" });
SurveyQuestion.hasMany(SurveyQuestion, { as: "childQuestions", foreignKey: "conditional_parent_id" });

SurveyQuestionOption.belongsTo(SurveyQuestion, { foreignKey: "question_id" });
SurveyQuestion.hasMany(SurveyQuestionOption, { foreignKey: "question_id" });

SurveyResponse.belongsTo(Survey, { foreignKey: "survey_id" });
Survey.hasMany(SurveyResponse, { foreignKey: "survey_id" });

SurveyResponse.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(SurveyResponse, { foreignKey: "user_id" });

SurveyAnswer.belongsTo(SurveyResponse, { foreignKey: "response_id" });
SurveyResponse.hasMany(SurveyAnswer, { foreignKey: "response_id" });

SurveyAnswer.belongsTo(SurveyQuestion, { foreignKey: "question_id" });
SurveyQuestion.hasMany(SurveyAnswer, { foreignKey: "question_id" });


// SUPPORT TICKET
SupportTicket.belongsTo(Company, { foreignKey: "company_id" });
Company.hasMany(SupportTicket, { foreignKey: "company_id" });

SupportTicket.belongsTo(User, { foreignKey: "created_by", as: "creator" });
SupportTicket.belongsTo(User, { foreignKey: "assigned_to", as: "assignee" });

SupportTicket.belongsTo(Task, { foreignKey: "related_task_id" });

TicketMessage.belongsTo(SupportTicket, { foreignKey: "ticket_id" });
SupportTicket.hasMany(TicketMessage, { foreignKey: "ticket_id" });

TicketMessage.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(TicketMessage, { foreignKey: "user_id" });

TicketFile.belongsTo(SupportTicket, { foreignKey: "ticket_id" });
SupportTicket.hasMany(TicketFile, { foreignKey: "ticket_id" });

TicketFile.belongsTo(TicketMessage, { foreignKey: "message_id" });
TicketMessage.hasMany(TicketFile, { foreignKey: "message_id" });

TicketFile.belongsTo(User, { foreignKey: "uploaded_by" });

TicketCategory.belongsTo(Company, { foreignKey: "company_id" });
Company.hasMany(TicketCategory, { foreignKey: "company_id" });


// EXPORT
module.exports = {
  sequelize,
  Sequelize,

  Company,
  Department,
  User,
  Customer,

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
  UserSkill,

  Survey,
  SurveyQuestion,
  SurveyQuestionOption,
  SurveyResponse,
  SurveyAnswer,

  SupportTicket,
  TicketMessage,
  TicketFile,
  TicketCategory
};