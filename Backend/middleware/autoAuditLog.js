const AuditLogService = require("../services/AuditLogService");

const SENSITIVE_KEYS = ["password", "token", "accessToken", "refreshToken", "secret", "authorization"];

const sanitizeValue = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (typeof value === "object") {
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
        sanitized[key] = "***";
      } else {
        sanitized[key] = sanitizeValue(val);
      }
    }
    return sanitized;
  }

  return value;
};

const actionByMethod = {
  POST: "CREATE",
  PUT: "UPDATE",
  PATCH: "UPDATE",
  DELETE: "DELETE",
};

const actionText = {
  CREATE: "oluşturuldu",
  UPDATE: "güncellendi",
  DELETE: "silindi",
};

const prettifyType = (rawType) => {
  const map = {
    task: "Görev",
    tasklist: "Görev listesi",
    tasklog: "Görev logu",
    taskcomment: "Görev yorumu",
    taskpriority: "Görev önceliği",
    taskstatus: "Görev durumu",
    survey: "Anket",
    role: "Rol",
    tag: "Etiket",
    contact: "Kişi",
    file: "Dosya",
    report: "Rapor",
    setting: "Ayar",
    dashboard: "Dashboard",
    notification: "Bildirim",
    personalnote: "Kişisel not",
    recurringtask: "Tekrarlayan görev",
    automationrule: "Otomasyon kuralı",
    sms: "SMS",
  };

  return map[rawType] || rawType;
};

const toBaseType = (typeOrPath) => {
  return String(typeOrPath || "")
    .replace(/^\/+/, "")
    .split("/")[0]
    .replace(/-/g, "")
    .toLowerCase();
};

const TARGET_NAME_KEYS = [
  "title",
  "name",
  "subject",
  "text",
  "questionText",
  "question_text",
  "code",
];

const readTargetNameFromObject = (obj) => {
  if (!obj || typeof obj !== "object") return null;

  for (const key of TARGET_NAME_KEYS) {
    const value = obj[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed && trimmed.length <= 120) return trimmed;
    }
  }

  return null;
};

const pickTargetName = (req, responseBody) => {
  const candidates = [
    responseBody?.data,
    responseBody,
    req.body,
  ];

  for (const candidate of candidates) {
    const name = readTargetNameFromObject(candidate);
    if (name) return name;
  }

  return null;
};

const pickRecordId = (req, responseBody) => {
  const candidates = [
    req.params?.id,
    req.params?.questionId,
    req.params?.userId,
    req.params?.taskId,
    responseBody?.id,
    responseBody?.data?.id,
  ];

  const first = candidates.find((x) => x !== undefined && x !== null);
  if (first === undefined) return null;

  const asNumber = Number(first);
  return Number.isNaN(asNumber) ? String(first) : asNumber;
};

const normalizeKey = (key) => String(key || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const getByNormalizedKey = (obj, expectedKeys = []) => {
  if (!obj || typeof obj !== "object") return undefined;
  const expected = new Set(expectedKeys.map((k) => normalizeKey(k)));

  for (const [key, value] of Object.entries(obj)) {
    if (expected.has(normalizeKey(key))) return value;
  }

  return undefined;
};

const summarizeDashboardPayload = (payload) => {
  if (!payload || typeof payload !== "object") return payload;

  const layouts = getByNormalizedKey(payload, ["dashboardLayouts", "layouts"]);
  const activeLayout = getByNormalizedKey(payload, ["activeLayout", "currentLayout"]);
  const taskTemplates = getByNormalizedKey(payload, ["taskTemplates", "templates"]);

  const keys = Object.keys(payload);
  const widgetSizeKeys = keys.filter((k) => normalizeKey(k).startsWith("dashboardwidgetsizes"));
  const widgetOrderKeys = keys.filter((k) => normalizeKey(k).startsWith("dashboardwidgetorder"));

  let activeLayoutName = null;
  if (Array.isArray(layouts) && activeLayout !== undefined && activeLayout !== null) {
    const active = layouts.find((item) => String(item?.id) === String(activeLayout));
    if (active) {
      activeLayoutName = active.name || active.title || null;
    }
  }

  return {
    activeLayoutId: activeLayout ?? null,
    activeLayoutName,
    layoutCount: Array.isArray(layouts) ? layouts.length : 0,
    taskTemplateCount: Array.isArray(taskTemplates) ? taskTemplates.length : 0,
    widgetSizeGroups: widgetSizeKeys.length,
    widgetOrderGroups: widgetOrderKeys.length,
  };
};

const buildAuditNewValue = (baseType, body, action) => {
  if (action === "DELETE") return null;

  const sanitized = sanitizeValue(body || {});
  if (baseType === "dashboard") {
    return JSON.stringify(summarizeDashboardPayload(sanitized));
  }

  return JSON.stringify(sanitized);
};

const autoAuditLog = (options = {}) => {
  return (req, res, next) => {
    const action = actionByMethod[req.method];
    if (!action) return next();

    let responseBody = null;
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      responseBody = body;
      return originalJson(body);
    };

    res.on("finish", async () => {
      try {
        if (res.statusCode >= 400) return;

        const user = req.user || {};
        const companyId = user.company_id || user.companyId;
        if (!companyId || !user.id) return;

        const baseType = toBaseType(options.type || req.baseUrl || req.originalUrl);
        if (!baseType || baseType === "auditlogs") return;

        const entityName = prettifyType(baseType);
        const targetName = pickTargetName(req, responseBody);
        const description = targetName
          ? `${entityName} ${actionText[action] || "işlendi"}: ${targetName}`
          : `${entityName} ${actionText[action] || "işlendi"}`;

        await AuditLogService.create({
          companyId,
          userId: user.id,
          userName: `${user.firstName || user.first_name || ""} ${user.lastName || user.last_name || ""}`.trim(),
          type: `${baseType}_${action.toLowerCase()}`,
          action,
          description,
          entity: entityName,
          tableName: null,
          recordId: pickRecordId(req, responseBody),
          oldValue: null,
          newValue: buildAuditNewValue(baseType, req.body, action),
          ipAddress: req.ip,
        });
      } catch (e) {
        // Audit hatası ana isteği etkilemesin.
      }
    });

    next();
  };
};

module.exports = autoAuditLog;
