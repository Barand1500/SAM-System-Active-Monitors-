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
const TicketResolutionHistory = require("./TicketResolutionHistory")(sequelize, DataTypes);

const PersonalNote = require("./PersonalNote")(sequelize, DataTypes);
const Contact = require("./Contact")(sequelize, DataTypes);
const Role = require("./Role")(sequelize, DataTypes);
const SmsGroup = require("./SmsGroup")(sequelize, DataTypes);
const SmsHistory = require("./SmsHistory")(sequelize, DataTypes);


// ============================
// RELATIONSHIPS
// ============================

// COMPANY
Company.hasMany(User, { foreignKey: "company_id", onDelete: "CASCADE" });
User.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });

Company.hasMany(Department, { foreignKey: "company_id", onDelete: "CASCADE" });
Department.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });

// USER → DEPARTMENT
User.belongsTo(Department, { foreignKey: "department_id" });
Department.hasMany(User, { foreignKey: "department_id" });


// TASK
Task.belongsTo(TaskList, { foreignKey: "task_list_id", onDelete: "CASCADE" });
TaskList.hasMany(Task, { foreignKey: "task_list_id", onDelete: "CASCADE" });

Task.belongsTo(User, { foreignKey: "creator_id", as: "creator" });

Task.belongsTo(TaskStatus, { foreignKey: "status_id", onDelete: "RESTRICT" });
Task.belongsTo(TaskPriority, { foreignKey: "priority_id", onDelete: "RESTRICT" });

Task.belongsTo(Category, { foreignKey: "category_id" });

// TASK SELF-REFERENCING (alt görevler)
Task.belongsTo(Task, { as: "parentTask", foreignKey: "parent_task_id" });
Task.hasMany(Task, { as: "subtasks", foreignKey: "parent_task_id" });


// TASK ASSIGNMENTS
TaskAssignment.belongsTo(Task, { foreignKey: "task_id", onDelete: "CASCADE" });
Task.hasMany(TaskAssignment, { foreignKey: "task_id", onDelete: "CASCADE" });

TaskAssignment.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });


// TASK TAGS
TaskTag.belongsTo(Task, { foreignKey: "task_id", onDelete: "CASCADE" });
TaskTag.belongsTo(Tag, { foreignKey: "tag_id", onDelete: "CASCADE" });

Task.belongsToMany(Tag, {
    through: TaskTag,
    foreignKey: "task_id"
});

Tag.belongsToMany(Task, {
    through: TaskTag,
    foreignKey: "tag_id"
});


// COMMENTS
TaskComment.belongsTo(Task, { foreignKey: "task_id", onDelete: "CASCADE" });
Task.hasMany(TaskComment, { foreignKey: "task_id", onDelete: "CASCADE" });

TaskComment.belongsTo(User, { foreignKey: "user_id" });

// COMMENT SELF-REFERENCING (threaded yanıtlar)
TaskComment.belongsTo(TaskComment, { as: "parentComment", foreignKey: "parent_comment_id" });
TaskComment.hasMany(TaskComment, { as: "replies", foreignKey: "parent_comment_id" });


// TASK LOG
TaskLog.belongsTo(Task, { foreignKey: "task_id", onDelete: "CASCADE" });
Task.hasMany(TaskLog, { foreignKey: "task_id", onDelete: "CASCADE" });

TaskLog.belongsTo(User, { foreignKey: "user_id" });


// TASK HISTORY
TaskHistory.belongsTo(Task, { foreignKey: "task_id", onDelete: "CASCADE" });
Task.hasMany(TaskHistory, { foreignKey: "task_id", onDelete: "CASCADE" });

TaskHistory.belongsTo(User, { foreignKey: "user_id", as: "changedBy" });


// FILES
File.belongsTo(User, { as: "uploader", foreignKey: "uploaded_by", onDelete: "SET NULL" });
File.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });

TaskFile.belongsTo(Task, { foreignKey: "task_id", onDelete: "CASCADE" });
TaskFile.belongsTo(File, { foreignKey: "file_id", onDelete: "CASCADE" });

CommentFile.belongsTo(TaskComment, { foreignKey: "comment_id", onDelete: "CASCADE" });
CommentFile.belongsTo(File, { foreignKey: "file_id", onDelete: "CASCADE" });


// ATTENDANCE
Attendance.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
User.hasMany(Attendance, { foreignKey: "user_id", onDelete: "CASCADE" });

Attendance.hasMany(Break, { foreignKey: "attendance_id", as: "breaks", onDelete: "CASCADE" });
Break.belongsTo(Attendance, { foreignKey: "attendance_id", onDelete: "CASCADE" });
Break.belongsTo(BreakType, { foreignKey: "break_type_id" });


// LEAVE
LeaveRequest.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
LeaveRequest.belongsTo(User, { as: "approver", foreignKey: "approved_by" });


// NOTIFICATIONS
Notification.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });


// ANNOUNCEMENTS
Announcement.belongsTo(User, { foreignKey: "user_id" });
Announcement.belongsTo(Company, { foreignKey: "company_id" });


// SETTINGS
CompanySetting.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });


// WORKSPACE
Workspace.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });
Company.hasMany(Workspace, { foreignKey: "company_id", onDelete: "CASCADE" });

Workspace.belongsTo(User, { foreignKey: "created_by", as: "workspaceCreator", onDelete: "CASCADE" });

WorkspaceMember.belongsTo(Workspace, { foreignKey: "workspace_id", onDelete: "CASCADE" });
Workspace.hasMany(WorkspaceMember, { foreignKey: "workspace_id", onDelete: "CASCADE" });

WorkspaceMember.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
User.hasMany(WorkspaceMember, { foreignKey: "user_id", onDelete: "CASCADE" });


// PROJECT
Project.belongsTo(Workspace, { foreignKey: "workspace_id", onDelete: "CASCADE" });
Workspace.hasMany(Project, { foreignKey: "workspace_id", onDelete: "CASCADE" });

Project.belongsTo(User, { foreignKey: "created_by", as: "projectCreator" });

ProjectMember.belongsTo(Project, { foreignKey: "project_id", onDelete: "CASCADE" });
Project.hasMany(ProjectMember, { foreignKey: "project_id", onDelete: "CASCADE" });

ProjectMember.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });


// TASK LIST
TaskList.belongsTo(Project, { foreignKey: "project_id", onDelete: "CASCADE" });
Project.hasMany(TaskList, { foreignKey: "project_id", onDelete: "CASCADE" });


// AUTOMATION
AutomationRule.belongsTo(Company, { foreignKey: "company_id" });


// USER SKILLS
UserSkill.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
User.hasMany(UserSkill, { foreignKey: "user_id", onDelete: "CASCADE" });


// RECURRING TASK
RecurringTask.belongsTo(User, { foreignKey: "created_by" });
RecurringTask.belongsTo(User, { as: "assignee", foreignKey: "assignee_id" });
RecurringTask.belongsTo(TaskPriority, { foreignKey: "priority_id" });
RecurringTask.belongsTo(TaskList, { foreignKey: "task_list_id" });


// DASHBOARD
UserDashboardSetting.belongsTo(User, { foreignKey: "user_id" });


// AUDIT
AuditLog.belongsTo(User, { foreignKey: "user_id" });

// PERSONAL NOTES
PersonalNote.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
PersonalNote.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });

// CONTACTS (Rehber)
Contact.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });

// ROLES
Role.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });
Company.hasMany(Role, { foreignKey: "company_id", onDelete: "CASCADE" });

// SMS
SmsGroup.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });
Company.hasMany(SmsGroup, { foreignKey: "company_id", onDelete: "CASCADE" });
SmsGroup.belongsTo(User, { foreignKey: "created_by", as: "creator" });

SmsHistory.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });
Company.hasMany(SmsHistory, { foreignKey: "company_id", onDelete: "CASCADE" });
SmsHistory.belongsTo(User, { foreignKey: "sent_by", as: "sender" });


// CUSTOMER
Customer.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });
Company.hasMany(Customer, { foreignKey: "company_id", onDelete: "CASCADE" });

Customer.belongsTo(Customer, { as: "parent", foreignKey: "parent_id", onDelete: "SET NULL" });
Customer.hasMany(Customer, { as: "children", foreignKey: "parent_id", onDelete: "SET NULL" });

Customer.belongsTo(User, { as: "creator", foreignKey: "created_by", onDelete: "SET NULL" });


// SURVEY
Survey.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });
Company.hasMany(Survey, { foreignKey: "company_id", onDelete: "CASCADE" });

Survey.belongsTo(User, { foreignKey: "created_by", as: "creator" });

SurveyQuestion.belongsTo(Survey, { foreignKey: "survey_id", onDelete: "CASCADE" });
Survey.hasMany(SurveyQuestion, { foreignKey: "survey_id", onDelete: "CASCADE" });

SurveyQuestion.belongsTo(SurveyQuestion, { as: "parentQuestion", foreignKey: "conditional_parent_id" });
SurveyQuestion.hasMany(SurveyQuestion, { as: "childQuestions", foreignKey: "conditional_parent_id" });

SurveyQuestionOption.belongsTo(SurveyQuestion, { foreignKey: "question_id", onDelete: "CASCADE" });
SurveyQuestion.hasMany(SurveyQuestionOption, { foreignKey: "question_id", onDelete: "CASCADE" });

SurveyResponse.belongsTo(Survey, { foreignKey: "survey_id", onDelete: "CASCADE" });
Survey.hasMany(SurveyResponse, { foreignKey: "survey_id", onDelete: "CASCADE" });

SurveyResponse.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(SurveyResponse, { foreignKey: "user_id" });

SurveyAnswer.belongsTo(SurveyResponse, { foreignKey: "response_id", onDelete: "CASCADE" });
SurveyResponse.hasMany(SurveyAnswer, { foreignKey: "response_id", onDelete: "CASCADE" });

SurveyAnswer.belongsTo(SurveyQuestion, { foreignKey: "question_id", onDelete: "CASCADE" });
SurveyQuestion.hasMany(SurveyAnswer, { foreignKey: "question_id", onDelete: "CASCADE" });


// SUPPORT TICKET
SupportTicket.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });
Company.hasMany(SupportTicket, { foreignKey: "company_id", onDelete: "CASCADE" });

SupportTicket.belongsTo(User, { foreignKey: "created_by", as: "creator", onDelete: "CASCADE" });
SupportTicket.belongsTo(User, { foreignKey: "assigned_to", as: "assignee" });

SupportTicket.belongsTo(Task, { foreignKey: "related_task_id" });

TicketMessage.belongsTo(SupportTicket, { foreignKey: "ticket_id", onDelete: "CASCADE" });
SupportTicket.hasMany(TicketMessage, { foreignKey: "ticket_id", onDelete: "CASCADE" });

TicketMessage.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
User.hasMany(TicketMessage, { foreignKey: "user_id", onDelete: "CASCADE" });

TicketFile.belongsTo(SupportTicket, { foreignKey: "ticket_id", onDelete: "CASCADE" });
SupportTicket.hasMany(TicketFile, { foreignKey: "ticket_id", onDelete: "CASCADE" });

TicketFile.belongsTo(TicketMessage, { foreignKey: "message_id" });
TicketMessage.hasMany(TicketFile, { foreignKey: "message_id" });

TicketFile.belongsTo(User, { foreignKey: "uploaded_by" });

TicketCategory.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });
Company.hasMany(TicketCategory, { foreignKey: "company_id", onDelete: "CASCADE" });

// TICKET RESOLUTION HISTORY
TicketResolutionHistory.belongsTo(SupportTicket, { foreignKey: "ticket_id", onDelete: "CASCADE" });
SupportTicket.hasMany(TicketResolutionHistory, { foreignKey: "ticket_id", onDelete: "CASCADE" });

TicketResolutionHistory.belongsTo(Company, { foreignKey: "company_id", onDelete: "CASCADE" });

TicketResolutionHistory.belongsTo(User, { foreignKey: "resolved_by", as: "resolver" });
TicketResolutionHistory.belongsTo(User, { foreignKey: "reopened_by", as: "reopener" });


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
  TicketCategory,
  TicketResolutionHistory,

  PersonalNote,
  Contact,
  Role,
  SmsGroup,
  SmsHistory
};