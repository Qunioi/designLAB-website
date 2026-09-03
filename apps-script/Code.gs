/**
 * Design LAB — Google Apps Script 後端 (v5.0 · 帳號驗證強化版)
 * ============================================================
 * 這支腳本是 Design LAB 唯一的「伺服器」。前端沒有其他後端，
 * 所有權限與密碼驗證都必須在這裡執行 —— 瀏覽器端的任何檢查
 * 都可被使用者自行繞過，不能當作真正的安全邊界。
 *
 * 這一版做了什麼：
 *   1. 密碼不再明文儲存或由前端比對，改為伺服器端加鹽雜湊
 *      （SHA-256 迭代雜湊），並且 GET 讀取一律不回傳密碼欄位。
 *   2. 新增登入端點，登入成功才會核發 Session Token；所有寫入／
 *      刪除／成員管理都必須附帶合法 Token，並依伺服器記錄的角色
 *      （Super Admin / Admin / User）授權 —— 不再信任前端宣稱的身分。
 *   3. 移除「帳號為 @quni_jhuang 就自動視為最高管理員」的後門，
 *      角色一律以 USERS 分頁實際記錄的值為準。
 *   4. 讀取（GET）維持公開、不需登入，符合「訪客可瀏覽、寫入才要
 *      登入」的需求。
 *   5. 新增登入失敗鎖定（5 次失敗鎖定 5 分鐘），降低密碼猜測風險。
 *
 * 部署方式：
 *   1. 開啟資料來源的 Google Sheets 試算表 → 擴充功能 → Apps Script。
 *   2. 用本檔案「整份內容」取代既有的 Code.gs（若有其他 .gs 檔案，
 *      建議一併刪除，避免函式重複定義）。
 *   3. 選單「部署」→「管理部署作業」：
 *        - 若已有既有部署，點選鉛筆圖示編輯 → 版本選「新版本」→ 部署，
 *          網址會維持不變，前端不需更新設定。
 *        - 若是全新部署，選「新增部署作業」→ 類型「網頁應用程式」→
 *          執行身分「我」→ 具有存取權限的使用者「任何人」→ 部署。
 *   4. 部署後，第一次務必手動呼叫一次初始化（見下方「首次設定」），
 *      建立好初始帳號後才對外分享網址，避免帳號被搶先建立。
 *   5. 若網址有變動，於 Design LAB 網站「設定」頁面貼上新的 Web App 網址。
 *
 * 首次設定：
 *   部署完成後，用瀏覽器或 curl 對 Web App 網址送出一次性的 POST：
 *     { "action": "setup" }
 *   此動作只有在 USERS 分頁完全空白時才會執行，會建立初始帳號並將
 *   臨時密碼設為 123456、標記為「首次登入必須改密碼」。已有資料時
 *   會直接回傳失敗，不會覆蓋既有帳號，可安全重複呼叫。
 */

// ------------------------------------------------------------
// 基本設定
// ------------------------------------------------------------
const SS = SpreadsheetApp.getActiveSpreadsheet();
const CACHE = CacheService.getScriptCache();

const SESSION_TTL_SECONDS = 6 * 60 * 60;   // Session 有效期 6 小時，每次驗證成功會自動延長（Sliding Expiration）
const LOGIN_LOCK_SECONDS = 5 * 60;         // 登入失敗鎖定 5 分鐘
const LOGIN_MAX_ATTEMPTS = 5;              // 連續失敗達此次數即鎖定
const HASH_ITERATIONS = 2000;              // 密碼雜湊迭代次數（Apps Script 無原生 bcrypt，以加鹽迭代雜湊折衷）
const DEFAULT_PASSWORD = '123456';         // 僅供新帳號的臨時密碼，強制下次登入變更

const ADMIN_ROLES = ['SUPER ADMIN', 'ADMIN'];
const PROTECTED_USERNAMES = ['@quni_jhuang', '@ray_zhao']; // 這些帳號無法被刪除

const USERS_SHEET = 'USERS';
const NOTIFICATIONS_SHEET = 'NOTIFICATIONS';
const CONTENT_SHEETS = ['UI_RESEARCH', 'MOTION_RESEARCH', 'COMPETITORS', 'AI_CENTER', 'RESOURCES', 'PROPOSALS'];
const ALL_SHEETS = CONTENT_SHEETS.concat([USERS_SHEET, NOTIFICATIONS_SHEET]);

const USERS_HEADERS = ['id', 'username', 'nickname', 'role', 'passwordHash', 'passwordSalt', 'mustChangePassword', 'themeClass', 'createdAt', 'updatedAt'];

// ------------------------------------------------------------
// 對外進入點
// ------------------------------------------------------------

/** 讀取一律公開，不需登入；USERS 分頁一律移除密碼欄位。 */
function doGet(e) {
  try {
    const sheetName = String((e.parameter && e.parameter.sheet) || '').toUpperCase();
    if (!sheetName || ALL_SHEETS.indexOf(sheetName) === -1) {
      return fail_('未知的資料表：' + sheetName);
    }
    let rows = readSheetObjects_(sheetName);
    if (sheetName === USERS_SHEET) {
      rows = rows.map(stripUserSecrets_);
    }
    return ok_({ data: rows });
  } catch (err) {
    return fail_('讀取失敗：' + err.message);
  }
}

/** 寫入 / 刪除 / 登入 / 成員管理都經由這裡分派，寫入類動作一律要求驗證。 */
function doPost(e) {
  let body;
  try {
    body = JSON.parse((e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return fail_('無法解析請求內容');
  }

  const action = body.action;
  try {
    switch (action) {
      case 'setup':              return handleSetup_();
      case 'login':               return handleLogin_(body);
      case 'logout':              return handleLogout_(body);
      case 'changePassword':      return handleChangePassword_(body);
      case 'addUser':             return withAuth_(body, ADMIN_ROLES, () => handleAddUser_(body));
      case 'removeUser':          return withAuth_(body, ADMIN_ROLES, () => handleRemoveUser_(body));
      case 'adminResetPassword':  return withAuth_(body, ADMIN_ROLES, () => handleAdminResetPassword_(body));
      case 'write':                return withAuth_(body, null, (session) => handleWrite_(body, session));
      case 'delete':               return withAuth_(body, null, (session) => handleDelete_(body, session));
      case 'overwrite_users':     return withAuth_(body, ADMIN_ROLES, () => handleOverwriteUsers_(body));
      case 'force_format_all':    return withAuth_(body, ADMIN_ROLES, () => handleForceFormatAll_());
      default: return fail_('未知的操作：' + action);
    }
  } catch (err) {
    return fail_('伺服器錯誤：' + err.message);
  }
}

// ------------------------------------------------------------
// 驗證與 Session
// ------------------------------------------------------------

/** 需要登入的動作共用入口：驗證 Token，選擇性檢查角色，再執行真正的處理函式。 */
function withAuth_(body, allowedRoles, handler) {
  const session = validateSession_(body.token);
  if (!session) return fail_('登入已逾期，請重新登入', 'AUTH_REQUIRED');
  if (allowedRoles && allowedRoles.indexOf(String(session.role).toUpperCase()) === -1) {
    return fail_('權限不足，僅限管理員操作', 'FORBIDDEN');
  }
  return handler(session);
}

function validateSession_(token) {
  if (!token) return null;
  const raw = CACHE.get('session:' + token);
  if (!raw) return null;
  CACHE.put('session:' + token, raw, SESSION_TTL_SECONDS); // 每次成功使用即延長效期
  return JSON.parse(raw);
}

function isGuestSession_(session) {
  const uname = (session.username || '').toLowerCase();
  return uname === '@guest' || uname === 'guest' || String(session.role || '').toUpperCase() === 'GUEST';
}

// ------------------------------------------------------------
// 登入 / 登出 / 密碼
// ------------------------------------------------------------

function handleLogin_(body) {
  const username = normalizeUsername_(body.username);
  const password = String(body.password || '');
  if (!username) return fail_('請輸入帳號 ID');

  const lockKey = 'lock:' + username;
  if (CACHE.get(lockKey)) {
    return fail_('登入失敗次數過多，請 5 分鐘後再試', 'LOCKED');
  }

  const sheet = getOrCreateSheet_(USERS_SHEET, USERS_HEADERS);
  const rowIndex = findRowIndexByKey_(sheet, 'username', username);
  if (rowIndex === -1) {
    return fail_('帳號 ID 不存在，請聯繫管理員建立帳號', 'NOT_FOUND');
  }
  if (!password) return fail_('請輸入登入密碼', 'PASSWORD_REQUIRED');

  const headers = getHeaders_(sheet);
  const rowValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  const row = rowToObject_(headers, rowValues);

  const verified = verifyOrMigratePassword_(sheet, rowIndex, headers, row, password);
  if (!verified) {
    recordFailedLogin_(username, lockKey);
    return fail_('登入密碼不正確，請重新輸入', 'BAD_PASSWORD');
  }
  CACHE.remove('fails:' + username);

  const token = Utilities.getUuid();
  const session = {
    token: token,
    username: row.username,
    nickname: row.nickname,
    role: row.role || 'User',
    createdAt: new Date().toISOString()
  };
  CACHE.put('session:' + token, JSON.stringify(session), SESSION_TTL_SECONDS);

  return ok_({
    token: token,
    user: { username: row.username, nickname: row.nickname, role: row.role || 'User' },
    mustChangePassword: truthy_(row.mustChangePassword)
  });
}

function recordFailedLogin_(username, lockKey) {
  const failKey = 'fails:' + username;
  const fails = Number(CACHE.get(failKey) || '0') + 1;
  CACHE.put(failKey, String(fails), LOGIN_LOCK_SECONDS);
  if (fails >= LOGIN_MAX_ATTEMPTS) {
    CACHE.put(lockKey, '1', LOGIN_LOCK_SECONDS);
  }
}

function handleLogout_(body) {
  if (body.token) CACHE.remove('session:' + body.token);
  return ok_({});
}

/** 使用者自行修改密碼，需要正確的舊密碼。 */
function handleChangePassword_(body) {
  const session = validateSession_(body.token);
  if (!session) return fail_('登入已逾期，請重新登入', 'AUTH_REQUIRED');

  const newPassword = String(body.newPassword || '').trim();
  if (newPassword.length < 4) return fail_('新密碼長度不得低於 4 個字元');

  const sheet = getOrCreateSheet_(USERS_SHEET, USERS_HEADERS);
  const rowIndex = findRowIndexByKey_(sheet, 'username', session.username);
  if (rowIndex === -1) return fail_('找不到該使用者');

  const headers = getHeaders_(sheet);
  const rowValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  const row = rowToObject_(headers, rowValues);

  const oldPassword = String(body.oldPassword || '');
  const verified = verifyOrMigratePassword_(sheet, rowIndex, headers, row, oldPassword);
  if (!verified) return fail_('舊密碼不正確，請重新輸入');
  if (oldPassword === newPassword) return fail_('新密碼不可與舊密碼相同');

  applyNewPassword_(sheet, rowIndex, headers, newPassword, false);
  writeCell_(sheet, rowIndex, headers, 'updatedAt', new Date().toISOString());
  return ok_({ message: '密碼修改成功' });
}

/** 管理員重設他人密碼為臨時密碼，強制下次登入變更（不需要舊密碼）。 */
function handleAdminResetPassword_(body) {
  const username = normalizeUsername_(body.targetUsername);
  const sheet = getOrCreateSheet_(USERS_SHEET, USERS_HEADERS);
  const rowIndex = findRowIndexByKey_(sheet, 'username', username);
  if (rowIndex === -1) return fail_('找不到該使用者');

  const headers = getHeaders_(sheet);
  applyNewPassword_(sheet, rowIndex, headers, DEFAULT_PASSWORD, true);
  return ok_({ message: '已重設為臨時密碼，使用者下次登入需強制變更密碼' });
}

function applyNewPassword_(sheet, rowIndex, headers, newPassword, mustChange) {
  const salt = generateSalt_();
  const hash = hashPassword_(newPassword, salt);
  writeCell_(sheet, rowIndex, headers, 'passwordHash', hash);
  writeCell_(sheet, rowIndex, headers, 'passwordSalt', salt);
  writeCell_(sheet, rowIndex, headers, 'mustChangePassword', mustChange);
  writeCell_(sheet, rowIndex, headers, 'password', ''); // 清除舊版殘留的明文欄位
}

/**
 * 驗證密碼；若該帳號仍是舊版明文 password 欄位（尚未雜湊過），
 * 驗證通過後立即就地升級為加鹽雜湊，並清空明文欄位。
 */
function verifyOrMigratePassword_(sheet, rowIndex, headers, row, password) {
  if (row.passwordHash && row.passwordSalt) {
    return hashPassword_(password, row.passwordSalt) === row.passwordHash;
  }
  const legacyPassword = (row.password !== undefined && row.password !== '') ? String(row.password) : DEFAULT_PASSWORD;
  if (password !== legacyPassword) return false;

  const salt = generateSalt_();
  const hash = hashPassword_(password, salt);
  writeCell_(sheet, rowIndex, headers, 'passwordHash', hash);
  writeCell_(sheet, rowIndex, headers, 'passwordSalt', salt);
  writeCell_(sheet, rowIndex, headers, 'password', '');
  return true;
}

function hashPassword_(password, salt) {
  let value = String(password) + '::' + salt;
  for (let i = 0; i < HASH_ITERATIONS; i++) {
    const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value + salt);
    value = bytes.map(function (b) { return (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'); }).join('');
  }
  return value;
}

function generateSalt_() {
  return Utilities.getUuid().replace(/-/g, '');
}

// ------------------------------------------------------------
// 成員管理（一律管理員限定）
// ------------------------------------------------------------

function handleAddUser_(body) {
  const nickname = String(body.nickname || '').trim();
  const username = normalizeUsername_(body.username);
  const role = normalizeRole_(body.role);
  if (!nickname || !username) return fail_('暱稱與帳號 ID 不可為空');

  const sheet = getOrCreateSheet_(USERS_SHEET, USERS_HEADERS);
  if (findRowIndexByKey_(sheet, 'username', username) !== -1) {
    return fail_('帳號 ID ' + username + ' 已存在');
  }

  const salt = generateSalt_();
  const hash = hashPassword_(DEFAULT_PASSWORD, salt);
  const now = new Date().toISOString();
  const headers = getHeaders_(sheet);
  const record = {
    id: 'u-' + Date.now(), username: username, nickname: nickname, role: role,
    passwordHash: hash, passwordSalt: salt, mustChangePassword: true,
    themeClass: 'theme-cloud-canvas', createdAt: now, updatedAt: now
  };
  sheet.appendRow(headers.map(function (h) { return record[h] !== undefined ? record[h] : ''; }));

  return ok_({ user: stripUserSecrets_(record) });
}

function handleRemoveUser_(body) {
  const username = normalizeUsername_(body.targetUsername);
  if (PROTECTED_USERNAMES.indexOf(username) !== -1) {
    return fail_('無法刪除受保護的管理員帳號');
  }
  const sheet = SS.getSheetByName(USERS_SHEET);
  if (!sheet) return fail_('找不到成員資料表');
  const rowIndex = findRowIndexByKey_(sheet, 'username', username);
  if (rowIndex === -1) return fail_('找不到該使用者');

  const headers = getHeaders_(sheet);
  const roleCol = headers.indexOf('role');
  const role = roleCol !== -1 ? String(sheet.getRange(rowIndex, roleCol + 1).getValue()).toUpperCase() : '';
  if (ADMIN_ROLES.indexOf(role) !== -1) {
    return fail_('無法刪除管理員帳號');
  }
  sheet.deleteRow(rowIndex);
  return ok_({});
}

/**
 * 團隊成員排序：只接受一份使用者名稱順序，依序搬動既有列，
 * 絕不用前端資料「整列覆寫」——避免把讀取時已被移除的密碼欄位
 * 誤寫回試算表、清空既有的密碼雜湊。
 */
function handleOverwriteUsers_(body) {
  const list = Array.isArray(body.data) ? body.data : [];
  const order = list.map(function (item) { return normalizeUsername_(item && item.username); }).filter(Boolean);
  if (!order.length) return ok_({});

  const sheet = SS.getSheetByName(USERS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return ok_({});
  const headers = getHeaders_(sheet);
  const usernameCol = headers.indexOf('username');
  if (usernameCol === -1) return ok_({});

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  const rowsByUsername = {};
  values.forEach(function (r) { rowsByUsername[normalizeUsername_(r[usernameCol])] = r; });

  const reordered = [];
  order.forEach(function (u) {
    if (rowsByUsername[u]) { reordered.push(rowsByUsername[u]); delete rowsByUsername[u]; }
  });
  // 保留任何不在排序清單內、但試算表中仍存在的帳號，避免資料遺失
  Object.keys(rowsByUsername).forEach(function (u) { reordered.push(rowsByUsername[u]); });

  if (reordered.length) {
    sheet.getRange(2, 1, reordered.length, headers.length).setValues(reordered);
  }
  return ok_({});
}

// ------------------------------------------------------------
// 一般資料寫入 / 刪除（案例、提案、通知等）
// ------------------------------------------------------------

function handleWrite_(body, session) {
  const sheetName = String(body.sheet || '').toUpperCase();
  const data = body.data;
  if (!data || typeof data !== 'object') return fail_('缺少寫入資料');

  if (sheetName === USERS_SHEET) {
    // 一般寫入只允許使用者更新「自己」的暱稱／主題偏好，角色與密碼一律走專用動作
    if (normalizeUsername_(data.username) !== session.username) {
      return fail_('僅能修改自己的帳號資料', 'FORBIDDEN');
    }
    const safeData = { username: session.username, updatedAt: new Date().toISOString() };
    ['nickname', 'themeClass'].forEach(function (f) { if (data[f] !== undefined) safeData[f] = data[f]; });
    upsertRowByKey_(USERS_SHEET, USERS_HEADERS, 'username', safeData);
    return ok_({});
  }

  if (CONTENT_SHEETS.indexOf(sheetName) !== -1) {
    if (isGuestSession_(session)) return fail_('訪客沒有寫入權限', 'FORBIDDEN');
    const identityStr = session.nickname + ' (' + session.username + ')';

    const sheet = SS.getSheetByName(sheetName);
    const rowIndex = (sheet && data.id) ? findRowIndexByKey_(sheet, 'id', data.id) : -1;

    if (rowIndex === -1) {
      // 新增：建立者資訊一律以伺服器驗證過的身分為準，前端宣稱的欄位會被覆寫
      data.createdBy = identityStr;
      data.creatorUsername = session.username;
      data.creatorName = session.nickname;
      data.updatedBy = identityStr;
    } else {
      // 編輯：任何已登入（非訪客）使用者皆可編輯任何項目，不限本人建立——
      // 僅有刪除（見 handleDelete_）仍限制僅本人或管理員可操作。
      data.updatedBy = identityStr;
    }

    upsertRowByKey_(sheetName, null, 'id', data);
    return ok_({});
  }

  if (sheetName === NOTIFICATIONS_SHEET) {
    if (isGuestSession_(session)) return fail_('訪客不可寫入通知', 'FORBIDDEN');
    upsertRowByKey_(NOTIFICATIONS_SHEET, null, 'id', data);
    return ok_({});
  }

  return fail_('未知的資料表：' + sheetName);
}

function handleDelete_(body, session) {
  const sheetName = String(body.sheet || '').toUpperCase();
  const id = body.id;
  if (!id) return fail_('缺少刪除目標 ID');

  if (sheetName === USERS_SHEET) {
    return fail_('請使用 removeUser 操作管理成員帳號');
  }
  if (CONTENT_SHEETS.indexOf(sheetName) === -1 && sheetName !== NOTIFICATIONS_SHEET) {
    return fail_('未知的資料表：' + sheetName);
  }

  if (sheetName === NOTIFICATIONS_SHEET) {
    if (isGuestSession_(session)) return fail_('訪客不可操作通知', 'FORBIDDEN');
  } else {
    const sheet = SS.getSheetByName(sheetName);
    if (sheet) {
      const rowIndex = findRowIndexByKey_(sheet, 'id', id);
      if (rowIndex !== -1) {
        const headers = getHeaders_(sheet);
        const rowValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
        const owner = pickOwner_(headers, rowValues);
        const isAdmin = ADMIN_ROLES.indexOf(String(session.role).toUpperCase()) !== -1;
        if (!isAdmin && !ownerMatchesSession_(owner, session)) {
          return fail_('權限不足，僅能刪除自己建立的項目', 'FORBIDDEN');
        }
      }
    }
  }

  deleteRowByKey_(sheetName, 'id', id);
  return ok_({});
}

function pickOwner_(headers, rowValues) {
  const idx = function (field) { return headers.indexOf(field); };
  const at = function (i) { return i !== -1 ? String(rowValues[i] || '') : ''; };
  return {
    createdBy: at(idx('createdBy')),
    updatedBy: at(idx('updatedBy')),
    creatorUsername: at(idx('creatorUsername'))
  };
}

function ownerMatchesSession_(owner, session) {
  const uname = session.username.toLowerCase();
  const nick = String(session.nickname || '').toLowerCase();
  const haystack = [owner.createdBy, owner.updatedBy, owner.creatorUsername].join(' ').toLowerCase();
  return haystack.indexOf(uname) !== -1 || (!!nick && haystack.indexOf(nick) !== -1);
}

function handleForceFormatAll_() {
  CONTENT_SHEETS.forEach(function (name) { getOrCreateSheet_(name, null); });
  getOrCreateSheet_(USERS_SHEET, USERS_HEADERS);
  getOrCreateSheet_(NOTIFICATIONS_SHEET, null);
  return ok_({});
}

// ------------------------------------------------------------
// 首次設定：只有在 USERS 分頁完全空白時才會建立初始帳號
// ------------------------------------------------------------

function handleSetup_() {
  const sheet = getOrCreateSheet_(USERS_SHEET, USERS_HEADERS);
  if (sheet.getLastRow() > 1) {
    return fail_('USERS 分頁已有資料，為避免覆蓋不執行初始化');
  }

  const seed = [
    ['@quni_jhuang', 'Quni', 'Super Admin'],
    ['@ray_zhao', 'Ray', 'Admin'],
    ['@rita_chen', 'Rita', 'User'],
    ['@adosa_chang', 'Adosa', 'User'],
    ['@clare_chen', 'Clare', 'User'],
    ['@yu-na', 'Yu-na', 'User'],
    ['@jason_hong', 'Jason', 'User']
  ];
  const now = new Date().toISOString();
  const headers = getHeaders_(sheet);
  seed.forEach(function (entry, i) {
    const salt = generateSalt_();
    const hash = hashPassword_(DEFAULT_PASSWORD, salt);
    const record = {
      id: 'u-' + (i + 1), username: entry[0], nickname: entry[1], role: entry[2],
      passwordHash: hash, passwordSalt: salt, mustChangePassword: true,
      themeClass: 'theme-cloud-canvas', createdAt: now, updatedAt: now
    };
    sheet.appendRow(headers.map(function (h) { return record[h] !== undefined ? record[h] : ''; }));
  });

  return ok_({ message: '已建立 ' + seed.length + ' 個初始帳號，臨時密碼為 ' + DEFAULT_PASSWORD + '，首次登入將強制要求變更密碼' });
}

// ------------------------------------------------------------
// 試算表存取共用工具
// ------------------------------------------------------------

function readSheetObjects_(name) {
  const sheet = SS.getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(function (h) { return String(h).trim(); });
  return values.slice(1)
    .filter(function (r) { return r.some(function (c) { return c !== '' && c !== null; }); })
    .map(function (r) { return rowToObject_(headers, r); });
}

function rowToObject_(headers, rowValues) {
  const obj = {};
  headers.forEach(function (h, i) { if (h) obj[h] = rowValues[i]; });
  return obj;
}

function stripUserSecrets_(row) {
  const clean = Object.assign({}, row);
  delete clean.passwordHash;
  delete clean.passwordSalt;
  delete clean.password; // 舊版殘留欄位保險起見一併移除
  return clean;
}

function getOrCreateSheet_(name, headers) {
  let sheet = SS.getSheetByName(name);
  if (!sheet) {
    sheet = SS.insertSheet(name);
    if (headers && headers.length) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }
  } else if (sheet.getLastRow() === 0 && headers && headers.length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getHeaders_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return String(h).trim(); });
}

function findRowIndexByKey_(sheet, keyField, keyValue) {
  const headers = getHeaders_(sheet);
  const keyCol = headers.indexOf(keyField);
  if (keyCol === -1) return -1;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const values = sheet.getRange(2, keyCol + 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).toLowerCase() === String(keyValue).toLowerCase()) return i + 2; // 轉為 1-based 列號
  }
  return -1;
}

/**
 * 依 keyField 新增或更新一列。更新既有列時，只覆寫 data 實際包含的
 * 欄位，其餘欄位維持原值不動——避免部分寫入（例如只改暱稱）
 * 意外把密碼雜湊等未提供的欄位清空。
 */
function upsertRowByKey_(name, fallbackHeaders, keyField, data) {
  let sheet = SS.getSheetByName(name);
  if (!sheet) sheet = SS.insertSheet(name);

  let headers = getHeaders_(sheet);
  if (!headers.length) {
    headers = (fallbackHeaders && fallbackHeaders.length) ? fallbackHeaders.slice() : Object.keys(data);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  Object.keys(data).forEach(function (field) {
    if (headers.indexOf(field) === -1) {
      sheet.getRange(1, headers.length + 1).setValue(field);
      headers.push(field);
    }
  });

  const rowIndex = findRowIndexByKey_(sheet, keyField, data[keyField]);
  if (rowIndex === -1) {
    sheet.appendRow(headers.map(function (h) { return data[h] !== undefined ? data[h] : ''; }));
    return;
  }
  const existingValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  const merged = headers.map(function (h, i) { return data[h] !== undefined ? data[h] : existingValues[i]; });
  sheet.getRange(rowIndex, 1, 1, merged.length).setValues([merged]);
}

function deleteRowByKey_(name, keyField, keyValue) {
  const sheet = SS.getSheetByName(name);
  if (!sheet) return false;
  const rowIndex = findRowIndexByKey_(sheet, keyField, keyValue);
  if (rowIndex === -1) return false;
  sheet.deleteRow(rowIndex);
  return true;
}

function normalizeUsername_(value) {
  let u = String(value || '').trim();
  if (!u) return '';
  if (!u.startsWith('@')) u = '@' + u;
  return u.toLowerCase();
}

function normalizeRole_(value) {
  const upper = String(value || 'User').trim().toUpperCase();
  if (upper === 'ADMIN') return 'Admin';
  if (upper === 'SUPER ADMIN' || upper === 'SUPER_ADMIN') return 'Super Admin';
  return 'User';
}

function truthy_(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

// ------------------------------------------------------------
// 回應輔助函式
// ------------------------------------------------------------

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function ok_(data) { return jsonOutput_(Object.assign({ success: true }, data)); }
function fail_(error, code) { return jsonOutput_({ success: false, error: error, code: code || 'ERROR' }); }
