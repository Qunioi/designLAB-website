<template>
  <div class="settings-view">
    <PageHeader
      title="系統與個人設定"
      subtitle="管理您的顯示暱稱、團隊成員權限、雲端資料庫同步與 8 套視覺主題"
    />

    <div class="settings-layout">
      <!-- LEFT COLUMN: Profile -->
      <section class="settings-panel glass-panel profile-panel">
        <div class="panel-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>Profile</span>
        </div>

        <!-- 當前帳號與頭像狀態 -->
        <div class="profile-avatar-area">
          <div class="avatar-user-info">
            <div class="avatar-circle" :class="{ 'admin-circle': isAdmin }">
              <span class="avatar-letter">{{ (nickname || '訪').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="avatar-meta">
              <div class="nickname-row">
                <span class="avatar-nickname">{{ nickname || '訪客' }}</span>
                <span v-if="isAdmin" class="admin-crown-wrap" title="已解鎖最高管理員權限">
                  <svg class="crown-icon-svg" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 4l3 12h14l3-12-6 7-4-5-4 5-6-7z"/>
                    <circle cx="12" cy="3.5" r="1.5"/>
                  </svg>
                </span>
              </div>
              <span class="avatar-handle">{{ username || '@account' }}</span>
            </div>
          </div>

          <!-- 已登入狀態：右上角「登出」按鈕 -->
          <button 
            v-if="isLoggedIn" 
            type="button" 
            class="logout-btn" 
            @click="handleLogout" 
            title="登出目前帳號"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <!-- <span>登出</span> -->
          </button>
        </div>

        <div class="profile-separator"></div>

        <!-- 未登入狀態：顯示 ACCOUNT ID 與密碼登入輸入框與登入按鈕 -->
        <form v-if="!isLoggedIn" @submit.prevent="handleQuickIDLogin" class="profile-form">
          <div class="field-group">
            <label class="field-label">ACCOUNT ID</label>
            <div class="field-input-wrap">
              <input 
                v-model="quickInputID" 
                type="text" 
                placeholder="account" 
                class="field-input" 
                autocomplete="username"
              />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">PASSWORD</label>
            <div class="field-input-wrap password-wrap">
              <input 
                v-model="quickInputPassword" 
                :type="showLoginPassword ? 'text' : 'password'" 
                placeholder="password" 
                class="field-input" 
                autocomplete="current-password"
              />
              <button 
                type="button" 
                class="password-toggle-btn" 
                @click="showLoginPassword = !showLoginPassword"
                :title="showLoginPassword ? '隱藏密碼' : '顯示密碼'"
              >
                <svg v-if="showLoginPassword" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="23" x2="23" y2="1"></line></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            </div>
          </div>

          <p v-if="loginErrorMsg" class="auth-error-msg" style="margin-top: 0.25rem;">⚠️ {{ loginErrorMsg }}</p>

          <button type="submit" class="save-btn" :disabled="!quickInputID.trim() || !quickInputPassword.trim()">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            登入帳號
          </button>
        </form>

        <!-- 已登入狀態：顯示 ACCOUNT ID (唯讀) 與 NICKNAME 修改表單 -->
        <form v-else @submit.prevent="saveProfile" class="profile-form">
          <div class="field-group">
            <label class="field-label">ACCOUNT ID (帳號 ID)</label>
            <p class="field-hint">由管理員於 Google Sheets 建立。點擊右側鑰匙圖示修改密碼。</p>
            <div class="field-input-wrap locked-wrap">
              <input :value="username" type="text" class="field-input" readonly />
              <button 
                type="button" 
                class="lock-toggle-btn" 
                @click="openChangePasswordModal" 
                title="點擊修改個人登入密碼"
              >
                <!-- 🔒 密碼鎖頭圖示 (標準 Lock SVG) -->
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </button>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">NICKNAME (顯示暱稱)</label>
            <p class="field-hint">您在 Design LAB 各項目的顯示暱稱。</p>
            <input v-model="localNickname" type="text" placeholder="Enter nickname" class="field-input" required />
          </div>

          <button type="submit" class="save-btn" :disabled="!isNicknameChanged">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            儲存暱稱修改
          </button>
        </form>

        <!-- 管理者專屬：彈窗開啟「團隊成員管理」按鈕 -->
        <div v-if="isAdmin" class="manage-users-block">
          <div class="profile-separator"></div>
          <button 
            type="button" 
            class="manage-users-trigger-btn" 
            @click="showUserMgmtModal = true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>團隊成員管理</span>
            <span class="user-count-badge">{{ (userProfiles && userProfiles.length) ? userProfiles.length : 0 }}</span>
          </button>
        </div>

        <!-- Quni 帳號專屬：超級管理員開發者模擬模式控制區 -->
        <div v-if="isDeveloperAccount" class="dev-mode-block">
          <div class="profile-separator"></div>
          <div class="dev-mode-box">
            <div class="dev-mode-header">
              <span class="dev-badge">開發者模擬模式</span>
            </div>
            <p class="field-hint">僅限 @quni_jhuang 開發測試使用。可即時模擬切換為任意成員帳號視角：</p>
            
            <div v-if="isImpersonating" class="impersonating-active-banner">
              <div class="banner-text">
                <span class="pulse-dot"></span>
                <span>正在模擬切換為：<strong>{{ nickname }} ({{ username }})</strong></span>
              </div>
              <button type="button" class="stop-impersonate-btn" @click="handleStopImpersonate">
                退出模擬 (返回 Quni)
              </button>
            </div>

            <div v-else class="dev-select-row">
              <select v-model="targetImpersonateUser" class="field-input dev-select">
                <option value="" disabled>-- 請選擇要模擬切換的帳號 --</option>
                <option value="@guest">訪客 (@guest)</option>
                <option 
                  v-for="p in userProfiles" 
                  :key="p.username" 
                  :value="p.username"
                  :disabled="p.username === '@quni_jhuang'"
                >
                  {{ p.nickname }} ({{ p.username }}) {{ p.role === 'ADMIN' ? '(管理員)' : '' }}
                </option>
              </select>
              <button 
                type="button" 
                class="impersonate-trigger-btn" 
                :disabled="!targetImpersonateUser"
                @click="handleStartImpersonate"
              >
                模擬切換
              </button>
            </div>
          </div>
        </div>

        <!-- 獨立彈窗 1：團隊成員管理 Modal 視窗 -->
        <Teleport to="body">
          <div v-if="showUserMgmtModal" class="modal-backdrop" :class="currentTheme" @click.self="showUserMgmtModal = false">
            <div class="modal-card user-mgmt-modal glass-panel" role="dialog" aria-modal="true">
              <div class="modal-header">
                <h3>
                  <svg class="crown-icon-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 4l3 12h14l3-12-6 7-4-5-4 5-6-7z"/>
                    <circle cx="12" cy="3.5" r="1.5"/>
                  </svg>
                  <span>團隊成員管理</span>
                </h3>
                <button type="button" class="close-btn" aria-label="關閉團隊成員管理" @click="showUserMgmtModal = false">✕</button>
              </div>

              <div class="modal-body user-mgmt-body">
                <!-- 新增成員區塊 -->
                <div class="um-section-box">
                  <label class="um-section-label">新增成員帳號與設定身分</label>
                  <form @submit.prevent="handleAddUser" class="add-user-modal-form">
                    <input v-model="newUserNickname" type="text" placeholder="顯示暱稱 (如: Alex)" class="field-input" required />
                    <input v-model="newUsername" type="text" placeholder="帳號 ID (如: @alex)" class="field-input" required />
                    <select v-model="newUserRole" class="field-input role-select">
                      <option value="User">一般使用者 (User)</option>
                      <option value="Admin">管理員 (Admin)</option>
                      <option value="Super Admin">最高管理員 (Super Admin)</option>
                    </select>
                    <button type="submit" class="add-member-btn">
                      <span>+ 新增成員</span>
                    </button>
                  </form>
                </div>

                <!-- 成員名單區塊 -->
                <div class="um-section-box">
                  <div class="um-list-header">
                    <span class="um-section-label">現有成員名單 (共 {{ (userProfiles && userProfiles.length) ? userProfiles.length : 0 }} 人)</span>
                  </div>

                  <div class="user-modal-list">
                    <div v-for="(p, index) in userProfiles" :key="p.id || p.username" class="user-modal-card">
                      <div class="user-modal-info">
                        <span class="user-modal-name">{{ p.nickname }}</span>
                        <span class="user-modal-handle">{{ p.username }}</span>
                      </div>
                      <div class="user-modal-right">
                        <!-- 自訂排序按鈕群 (⬆️ 上移 / ⬇️ 下移) -->
                        <div class="user-reorder-btns">
                          <button 
                            type="button" 
                            class="order-btn" 
                            :disabled="index === 0" 
                            @click="handleMoveUser(index, -1)"
                            title="向上移動成員順序"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
                          </button>
                          <button 
                            type="button" 
                            class="order-btn" 
                            :disabled="index === userProfiles.length - 1" 
                            @click="handleMoveUser(index, 1)"
                            title="向下移動成員順序"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>
                        </div>

                        <span class="user-role-tag" :class="(p.role || '').toLowerCase().includes('admin') ? 'admin' : 'user'">
                          <span>{{ p.role || 'User' }}</span>
                        </span>
                        <button 
                          v-if="!(p.role || '').toLowerCase().includes('admin') && p.username !== '@quni_jhuang' && p.username !== '@ray_zhao'" 
                          class="del-user-btn" 
                          @click="handleDeleteUser(p.username)" 
                          title="刪除此成員"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div class="modal-footer">
                <button class="cancel-btn" @click="showUserMgmtModal = false">關閉</button>
              </div>
            </div>
          </div>
        </Teleport>

        <!-- 獨立彈窗 2：修改個人密碼 Modal 視窗 -->
        <Teleport to="body">
          <div v-if="showChangePassModal" class="modal-backdrop" :class="currentTheme" @click.self="showChangePassModal = false">
            <div class="modal-card auth-modal glass-panel" role="dialog" aria-modal="true">
              <div class="modal-header">
                <h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <span>修改個人密碼 (Change Password)</span>
                </h3>
                <button type="button" class="close-btn" aria-label="關閉修改密碼" @click="showChangePassModal = false">✕</button>
              </div>
              <div class="modal-body">
                <p class="auth-desc">修改帳號 <code>{{ username }}</code> 的個人登入密碼：</p>

                <div class="field-group" style="margin-bottom: 0.85rem;">
                  <label class="field-label">原密碼 (Current Password)</label>
                  <input 
                    v-model="oldPasswordInput" 
                    type="password" 
                    placeholder="請輸入原密碼 (預設: 123456)" 
                    class="field-input" 
                  />
                </div>

                <div class="field-group" style="margin-bottom: 0.85rem;">
                  <label class="field-label">新密碼 (New Password)</label>
                  <input 
                    v-model="newPasswordInput" 
                    type="password" 
                    placeholder="請輸入新密碼" 
                    class="field-input" 
                  />
                </div>

                <div class="field-group">
                  <label class="field-label">確認新密碼 (Confirm New Password)</label>
                  <input 
                    v-model="confirmPasswordInput" 
                    type="password" 
                    placeholder="請再次輸入新密碼" 
                    class="field-input" 
                  />
                </div>

                <p v-if="passErrorMsg" class="auth-error-msg">⚠️ {{ passErrorMsg }}</p>
              </div>
              <div class="modal-footer">
                <button class="cancel-btn" @click="showChangePassModal = false">取消</button>
                <button class="submit-btn" @click="handleChangePasswordSubmit">確認修改密碼</button>
              </div>
            </div>
          </div>
        </Teleport>

        <!-- 管理員密碼驗證 Modal 視窗 (帶 :class="currentTheme") -->
        <Teleport to="body">
          <div v-if="showAuthModal" class="modal-backdrop" :class="currentTheme" @click.self="showAuthModal = false">
            <div class="modal-card auth-modal glass-panel" role="dialog" aria-modal="true">
              <div class="modal-header">
                <h3>管理員身份解鎖驗證</h3>
                <button type="button" class="close-btn" aria-label="關閉管理員驗證" @click="showAuthModal = false">✕</button>
              </div>
              <div class="modal-body">
                <p class="auth-desc">請輸入管理員 <code>@quni_jhuang</code> 專屬驗證密碼（設定於 USERS 表單）：</p>
                <div class="field-group">
                  <input 
                    v-model="inputPasscode" 
                    type="password" 
                    placeholder="請輸入管理員解鎖密碼" 
                    class="field-input auth-input" 
                    @keyup.enter="handleVerifyPasscode"
                    ref="passcodeInputRef"
                    autofocus
                  />
                </div>
                <p v-if="authError" class="auth-error-msg">⚠️ 解鎖失敗：密碼不正確！請重新輸入。</p>
              </div>
              <div class="modal-footer">
                <button class="cancel-btn" @click="showAuthModal = false">取消</button>
                <button class="submit-btn" @click="handleVerifyPasscode">驗證解鎖</button>
              </div>
            </div>
          </div>
        </Teleport>


      </section>


      <!-- RIGHT COLUMN: Theme Picker -->
      <section class="settings-panel glass-panel theme-panel">
        <div class="panel-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 0 0 20 4 4 0 0 0 0-8 2 2 0 0 1 0-4 10 10 0 0 0 0-8z"></path></svg>
          <span>Appearance</span>
        </div>

        <!-- Dark Section -->
        <div class="theme-group">
          <h3 class="theme-group-label">Dark Themes</h3>
          <div class="theme-cards-row">
            <div 
              v-for="theme in darkThemes" 
              :key="theme.class"
              class="theme-card"
              :class="[theme.class, { selected: currentTheme === theme.class }]"
              @click="$emit('select-theme', theme.class)"
            >
              <div class="theme-preview" :style="theme.previewStyle">
                <div class="preview-sidebar" :style="{ background: theme.sidebarColor }"></div>
                <div class="preview-body">
                  <div class="preview-line long" :style="{ background: theme.textColor }"></div>
                  <div class="preview-line short" :style="{ background: theme.accentColor }"></div>
                  <div class="preview-cards-row">
                    <div class="preview-mini-card" :style="{ background: theme.cardColor, borderColor: theme.borderColor }"></div>
                    <div class="preview-mini-card" :style="{ background: theme.cardColor, borderColor: theme.borderColor }"></div>
                  </div>
                </div>
              </div>
              <div class="theme-card-footer">
                <div class="theme-name-wrap">
                  <h4>{{ theme.name }}</h4>
                  <span class="selected-indicator" v-if="currentTheme === theme.class">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Light Section -->
        <div class="theme-group">
          <h3 class="theme-group-label">Light Themes</h3>
          <div class="theme-cards-row">
            <div 
              v-for="theme in lightThemes" 
              :key="theme.class"
              class="theme-card"
              :class="[theme.class, { selected: currentTheme === theme.class }]"
              @click="$emit('select-theme', theme.class)"
            >
              <div class="theme-preview" :style="theme.previewStyle">
                <div class="preview-sidebar" :style="{ background: theme.sidebarColor }"></div>
                <div class="preview-body">
                  <div class="preview-line long" :style="{ background: theme.textColor }"></div>
                  <div class="preview-line short" :style="{ background: theme.accentColor }"></div>
                  <div class="preview-cards-row">
                    <div class="preview-mini-card" :style="{ background: theme.cardColor, borderColor: theme.borderColor }"></div>
                    <div class="preview-mini-card" :style="{ background: theme.cardColor, borderColor: theme.borderColor }"></div>
                  </div>
                </div>
              </div>
              <div class="theme-card-footer">
                <div class="theme-name-wrap">
                  <h4>{{ theme.name }}</h4>
                  <span class="selected-indicator" v-if="currentTheme === theme.class">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Google Sheets 整合面板 -->
    <section class="settings-panel glass-panel sheets-panel">
      <div class="panel-label">
        <!-- Google Sheets icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
        <span>Google Sheets 資料庫</span>
        <span class="connection-dot" :class="connectionStatus"></span>
        <span class="connection-label">{{ connectionLabel }}</span>
      </div>

      <div class="sheets-body">
        <!-- URL 輸入 (僅管理員可修改，一般使用者唯讀) -->
        <div class="field-group">
          <label class="field-label">Apps Script 網址</label>
          <p class="field-hint" v-if="isAdmin">Apps Script 部署為 Web App 後產生的網址。</p>
          <p class="field-hint" v-else>由管理員設定之 Web App 網址（唯讀狀態，一般使用者不可修改）。</p>
          <div class="sheets-url-row">
            <div class="field-input-wrap sheets-url-wrap" :class="{ locked: !isAdmin }">
              <input
                v-model="localSheetsUrl"
                type="text"
                class="field-input sheets-url-input"
                :readonly="!isAdmin"
                placeholder="https://script.google.com/macros/s/.../exec"
              />
              <span v-if="!isAdmin" class="lock-indicator">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </span>
            </div>
            <button class="test-btn" @click="testConnection" :disabled="!isAdmin || isTesting" :title="isAdmin ? '測試連線' : '僅管理員可進行測試連線'">
              {{ isTesting ? '連線中...' : '測試連線' }}
            </button>
          </div>
        </div>

        <!-- 操作按鈕區 -->
        <div class="sheets-actions">
          <div class="sync-info">
            <span class="sync-time" v-if="lastSyncTime">{{ lastSyncLabel }}</span>
            <span class="sync-time" v-else>尚未同步</span>
          </div>
          <div class="sheets-btns">
            <!-- 推送全量資料與格式化（僅管理者可使用與顯示） -->
            <button 
              v-if="isAdmin"
              class="sheets-btn primary" 
              @click="pushAll" 
              :disabled="isPushing" 
              title="將本地帶有標準時間與操作者欄位的資料全量矯正並上傳至 Google Sheets"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
              {{ isPushing ? '全量上傳中...' : '推送全量資料與格式化 (Push All to Sheets)' }}
            </button>

            <!-- 從 Sheets 重新同步（所有人可用） -->
            <button class="sheets-btn secondary" @click="runSync" :disabled="isSyncing">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              {{ isSyncing ? '同步中...' : '從 Sheets 重新同步 (Sync from Sheets)' }}
            </button>
          </div>
        </div>



        <!-- 狀態訊息 -->
        <div class="sync-message" v-if="syncMessage" :class="syncMessageType">
          {{ syncMessage }}
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import NotificationBell from '../components/NotificationBell.vue';


import {
  getSheetsUrl, setSheetsUrl,
  testSheetsConnection, syncAllFromSheets, pushAllToSheets
} from '../utils/sheetsAPI';

import { 
  getUserProfiles, 
  getCurrentUser,
  setCurrentUser, 
  loginByAccountID,
  isAdminUser,
  lockAdmin,
  addUserProfile,
  removeUserProfile,
  reorderUserProfiles,
  getImpersonatorStatus,
  impersonateUser,
  stopImpersonating,
  updateUserPassword
} from '../utils/userStore';

const targetImpersonateUser = ref('');
const impersonatorInfo = ref(getImpersonatorStatus());
const isImpersonating = computed(() => impersonatorInfo.value.isImpersonating);

// 是否為開發者帳號 Quni (或是正處於模擬狀態中的開發者)
const isDeveloperAccount = computed(() => {
  return isImpersonating.value || props.username.toLowerCase() === '@quni_jhuang' || props.username.toLowerCase() === 'quni_jhuang';
});

const handleStartImpersonate = () => {
  if (!targetImpersonateUser.value) return;
  try {
    const targetUserObj = impersonateUser(targetImpersonateUser.value);
    impersonatorInfo.value = getImpersonatorStatus();
    emit('update-user', { nickname: targetUserObj.nickname, username: targetUserObj.username });
  } catch (e) {
    alert(e.message);
  }
};

const handleStopImpersonate = () => {
  const result = stopImpersonating();
  impersonatorInfo.value = getImpersonatorStatus();
  targetImpersonateUser.value = '';
  emit('update-user', { nickname: result.nickname, username: result.username });
};

const handleMoveUser = (index, delta) => {
  const targetIndex = index + delta;
  if (targetIndex >= 0 && targetIndex < userProfiles.value.length) {
    userProfiles.value = reorderUserProfiles(index, targetIndex);
  }
};



const props = defineProps({
  nickname: { type: String, required: true },
  username: { type: String, required: true },
  currentTheme: { type: String, required: true }
});

const emit = defineEmits(['update-nickname', 'update-user', 'select-theme']);

const userProfiles = ref([]);
const localNickname = ref(props.nickname);
const localUsername = ref(props.username);

const isLoggedIn = computed(() => {
  return props.username && props.username !== '@guest' && props.username !== 'guest' && props.username !== '@account';
});

watch(() => props.nickname, (v) => { 
  if (v && v !== '訪客') localNickname.value = v; 
}, { immediate: true });

watch(() => props.username, (v) => { 
  localUsername.value = v;
  if (v) {
    const profiles = getUserProfiles();
    const matched = profiles.find(p => p.username.toLowerCase() === v.toLowerCase());
    if (matched && matched.nickname) {
      localNickname.value = matched.nickname;
    } else if (v.toLowerCase() === '@quni_jhuang' || v.toLowerCase() === 'quni_jhuang') {
      localNickname.value = 'Quni';
    }
  }
}, { immediate: true });

const showUserMgmtModal = ref(false);
const newUserNickname = ref('');
const newUsername = ref('');
const newUserRole = ref('USER');

const showAuthModal = ref(false);
const inputPasscode = ref('');
const authError = ref(false);


const handleAddUser = () => {
  try {
    if (!newUserNickname.value.trim() || !newUsername.value.trim()) return;
    addUserProfile({
      nickname: newUserNickname.value,
      username: newUsername.value,
      role: newUserRole.value
    });
    newUserNickname.value = '';
    newUsername.value = '';
    newUserRole.value = 'USER';
    refreshProfiles();
    alert('成功新增成員並同步至 Google Sheets USERS 分頁！');
  } catch (err) {
    alert(err.message || '新增成員失敗！');
  }
};


const handleDeleteUser = (targetUsername) => {
  if (confirm(`確定要刪除成員 ${targetUsername} 嗎？`)) {
    try {
      removeUserProfile(targetUsername);
      refreshProfiles();
      alert('已成功刪除該成員！');
    } catch (err) {
      alert(err.message || '刪除成員失敗！');
    }
  }
};


const isAdmin = computed(() => {
  const currentUser = getCurrentUser();
  const r = (currentUser.role || '').toLowerCase();
  const u = (props.username || currentUser.username || '').toLowerCase();
  return u === '@quni_jhuang' || u === 'quni_jhuang' || r === 'super admin' || r === 'admin' || r === 'super_admin';
});

// 修改個人密碼狀態與處理方法
const showChangePassModal = ref(false);
const oldPasswordInput = ref('');
const newPasswordInput = ref('');
const confirmPasswordInput = ref('');
const passErrorMsg = ref('');

const openChangePasswordModal = () => {
  oldPasswordInput.value = '';
  newPasswordInput.value = '';
  confirmPasswordInput.value = '';
  passErrorMsg.value = '';
  showChangePassModal.value = true;
};

const handleChangePasswordSubmit = () => {
  passErrorMsg.value = '';
  if (!oldPasswordInput.value) {
    passErrorMsg.value = '請輸入原密碼！';
    return;
  }
  if (!newPasswordInput.value || !newPasswordInput.value.trim()) {
    passErrorMsg.value = '新密碼不能為空！';
    return;
  }
  if (newPasswordInput.value.trim().length < 4) {
    passErrorMsg.value = '新密碼長度不得低於 4 個字元！';
    return;
  }
  if (newPasswordInput.value.trim() === oldPasswordInput.value.trim()) {
    passErrorMsg.value = '新密碼不可與舊密碼相同！';
    return;
  }
  if (newPasswordInput.value !== confirmPasswordInput.value) {
    passErrorMsg.value = '兩次輸入的新密碼不一致！';
    return;
  }

  const result = updateUserPassword(props.username, oldPasswordInput.value, newPasswordInput.value);
  if (result.success) {
    alert('密碼修改成功！新密碼已儲存。');
    showChangePassModal.value = false;
  } else {
    passErrorMsg.value = result.error || '密碼修改失敗！';
  }
};

const handleVerifyPasscode = () => {
  if (verifyAdminPasscode(inputPasscode.value)) {
    showAuthModal.value = false;
    authError.value = false;
    inputPasscode.value = '';
    refreshProfiles();
    const u = { nickname: localNickname.value || 'Quni', username: '@quni_jhuang', role: 'ADMIN' };
    emit('update-user', u);
    emit('update-nickname', u.nickname);
  } else {
    authError.value = true;
  }
};

const handleLockAdmin = () => {
  lockAdmin();
  showUserMgmtModal.value = false;
  const u = setCurrentUser('訪客', '@account', 'USER');
  refreshProfiles();
  emit('update-user', u);
  emit('update-nickname', u.nickname);
};

const handleLogout = () => {
  try {
    stopImpersonating();
  } catch(e){}
  lockAdmin();
  showUserMgmtModal.value = false;
  const u = setCurrentUser('訪客', '@guest', 'USER');
  localNickname.value = u.nickname;
  localUsername.value = u.username;
  quickInputID.value = '';
  quickInputPassword.value = '';
  showLoginPassword.value = false;
  loginErrorMsg.value = '';
  refreshProfiles();
  emit('update-user', u);
  emit('update-nickname', u.nickname);
};



const refreshProfiles = () => {
  userProfiles.value = getUserProfiles();
};

watch(() => props.nickname, (v) => { localNickname.value = v; });
watch(() => props.username, (v) => { localUsername.value = v; });


const quickInputID = ref('');
const quickInputPassword = ref('');
const showLoginPassword = ref(false);
const loginErrorMsg = ref('');

watch([quickInputID, quickInputPassword], () => {
  if (loginErrorMsg.value) loginErrorMsg.value = '';
});

const handleQuickIDLogin = () => {
  loginErrorMsg.value = '';
  const input = quickInputID.value.trim();
  const pass = quickInputPassword.value.trim();

  if (!input) {
    loginErrorMsg.value = '請輸入帳號 ID！';
    return;
  }
  if (!pass) {
    loginErrorMsg.value = '請輸入登入密碼！';
    return;
  }

  const res = loginByAccountID(input, pass);
  if (res.error) {
    loginErrorMsg.value = res.error;
    return;
  }
  if (res.user) {
    localNickname.value = res.user.nickname;
    localUsername.value = res.user.username;
    refreshProfiles();
    emit('update-user', res.user);
    emit('update-nickname', res.user.nickname);
    quickInputID.value = '';
    quickInputPassword.value = '';
    showLoginPassword.value = false;
    loginErrorMsg.value = '';
  }
};

const isNicknameChanged = computed(() => {
  const currentNick = (localNickname.value || '').trim();
  const propNick = (props.nickname || '').trim();
  return currentNick !== '' && currentNick !== propNick;
});

const handleUserSwitch = (e) => {
  const selectedUser = e.target.value;
  if (!selectedUser) return;

  if (selectedUser.toLowerCase() === '@quni_jhuang') {
    if (!isAdmin.value) {
      showAuthModal.value = true;
      authError.value = false;
      inputPasscode.value = '';
      return;
    }
  }

  if (selectedUser.toLowerCase() === '@account') {
    lockAdmin();
    const user = setCurrentUser('訪客', '@account', 'USER');
    localNickname.value = user.nickname;
    localUsername.value = user.username;
    refreshProfiles();
    emit('update-user', user);
    emit('update-nickname', user.nickname);
    return;
  }

  const res = loginByAccountID(selectedUser);
  if (res.requiresPassword) {
    showAuthModal.value = true;
    authError.value = false;
    inputPasscode.value = '';
  } else if (res.user) {
    localNickname.value = res.user.nickname;
    localUsername.value = res.user.username;
    refreshProfiles();
    emit('update-user', res.user);
    emit('update-nickname', res.user.nickname);
  }
};

const saveProfile = () => {
  const nick = (localNickname.value || '').trim();
  if (nick !== '') {
    const user = setCurrentUser(nick, props.username || '@quni_jhuang');
    refreshProfiles();
    emit('update-user', user);
    emit('update-nickname', user.nickname);
  }
};



// ── Google Sheets 整合狀態 ──
const localSheetsUrl = ref('');
const connectionStatus = ref('unknown');  // 'connected' | 'error' | 'unknown'
const isTesting = ref(false);
const isSyncing = ref(false);
const isPushing = ref(false);
const lastSyncTime = ref(null);
const syncMessage = ref('');
const syncMessageType = ref('info'); // 'info' | 'success' | 'error'

onMounted(() => {
  localSheetsUrl.value = getSheetsUrl();
  refreshProfiles();
});


const connectionLabel = computed(() => {
  if (connectionStatus.value === 'connected') return '已連線';
  if (connectionStatus.value === 'error') return '連線失敗';
  return '未驗證';
});

const lastSyncLabel = computed(() => {
  if (!lastSyncTime.value) return '';
  return `上次同步：${lastSyncTime.value}`;
});

const testConnection = async () => {
  if (localSheetsUrl.value.trim()) {
    setSheetsUrl(localSheetsUrl.value.trim());
  }
  isTesting.value = true;
  syncMessage.value = '';
  const result = await testSheetsConnection();
  isTesting.value = false;
  connectionStatus.value = result.ok ? 'connected' : 'error';
  syncMessage.value = result.ok
    ? 'Google Sheets 連線成功！'
    : `連線失敗：${result.error}`;
  syncMessageType.value = result.ok ? 'success' : 'error';
};

const runSync = async () => {
  isSyncing.value = true;
  syncMessage.value = '正在從 Google Sheets 同步資料...';
  syncMessageType.value = 'info';
  const result = await syncAllFromSheets();
  isSyncing.value = false;
  const now = new Date().toLocaleTimeString('zh-TW');
  lastSyncTime.value = now;
  if (result.success) {
    const total = Object.values(result.counts).reduce((a, b) => a + b, 0);
    syncMessage.value = `同步完成！共讀入 ${total} 筆資料。`;
    syncMessageType.value = 'success';
    connectionStatus.value = 'connected';
  } else {
    syncMessage.value = `部分同步失敗：${result.errors.map(e => e.key).join(', ')}`;
    syncMessageType.value = 'error';
  }
};

const pushAll = async () => {
  isPushing.value = true;
  syncMessage.value = '正在上傳本地資料到 Google Sheets...';
  syncMessageType.value = 'info';
  await pushAllToSheets();
  isPushing.value = false;
  syncMessage.value = '上傳完成！資料已寫入 Google Sheets。';
  syncMessageType.value = 'success';
};

const darkThemes = [
  {
    class: 'theme-midnight-indigo',
    name: 'Palenight Theme',
    previewStyle: { background: '#0e0f14' },
    sidebarColor: '#171926',
    textColor: 'rgba(243,241,247,0.72)',
    accentColor: '#8b5cc7',
    cardColor: 'rgba(41,45,66,0.92)',
    borderColor: 'rgba(201,203,234,0.12)'
  },
  {
    class: 'theme-github-dark',
    name: 'Graphite Blue',
    previewStyle: { background: '#17191f' },
    sidebarColor: '#14161c',
    textColor: 'rgba(245,247,251,0.68)',
    accentColor: '#78a9ff',
    cardColor: 'rgba(35,39,49,0.9)',
    borderColor: 'rgba(226,232,240,0.1)'
  },
  {
    class: 'theme-obsidian-neon',
    name: 'Ember Atelier',
    previewStyle: { background: '#171412' },
    sidebarColor: '#12100f',
    textColor: 'rgba(255,247,237,0.68)',
    accentColor: '#e5a86b',
    cardColor: 'rgba(41,35,31,0.9)',
    borderColor: 'rgba(255,237,213,0.1)'
  },
  {
    class: 'theme-nord-dark',
    name: 'Nord Polar Night',
    previewStyle: { background: '#2e3440' },
    sidebarColor: '#3b4252',
    textColor: 'rgba(216,222,233,0.6)',
    accentColor: '#88c0d0',
    cardColor: 'rgba(59,66,82,0.85)',
    borderColor: 'rgba(216,222,233,0.1)'
  }
];

const lightThemes = [
  {
    class: 'theme-cloud-canvas',
    name: 'Cloud Canvas',
    previewStyle: { background: '#f8f9fc' },
    sidebarColor: '#eef0f5',
    textColor: 'rgba(15,23,42,0.5)',
    accentColor: '#2563eb',
    cardColor: 'rgba(255,255,255,0.92)',
    borderColor: 'rgba(15,23,42,0.06)'
  },
  {
    class: 'theme-material-light',
    name: 'Material Light',
    previewStyle: { background: '#fafafa' },
    sidebarColor: '#f0f0f0',
    textColor: 'rgba(33,33,33,0.6)',
    accentColor: 'hsl(174 42% 50%)',
    cardColor: 'rgba(255,255,255,0.95)',
    borderColor: 'rgba(0,0,0,0.08)'
  },
  {
    class: 'theme-office-access',
    name: 'Office Access',
    previewStyle: { background: '#f3f2f1' },
    sidebarColor: '#faf9f8',
    textColor: 'rgba(50,49,48,0.68)',
    accentColor: '#b23a3f',
    cardColor: '#ffffff',
    borderColor: 'rgba(50,49,48,0.12)'
  },




  {
    class: 'theme-nord-light',
    name: 'Nord Snow',
    previewStyle: { background: '#eceff4' },
    sidebarColor: '#e5e9f0',
    textColor: 'rgba(46,52,64,0.6)',
    accentColor: '#5e81ac',
    cardColor: 'rgba(255,255,255,0.95)',
    borderColor: 'rgba(46,52,64,0.08)'
  }
];

</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.settings-page-title {
  font-size: var(--fs-h1);
  font-weight: var(--fw-black);
  letter-spacing: -0.02em;
}

.settings-page-sub {
  color: var(--text-secondary);
  font-size: var(--fs-body);
  margin-top: 0.35rem;
}

/* Main layout: profile left, themes right */
.settings-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1rem;
  align-items: start;
}

/* Panel shared style */
.settings-panel {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--fs-caption);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.panel-label svg {
  opacity: 0.6;
}

.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Quni 專屬開發者模擬模式區塊 ────────────── */
.dev-mode-block {
  margin-top: 1rem;
}

.dev-mode-box {
  background: var(--glow-primary);
  border: 1px dashed var(--color-primary);
  border-radius: 12px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dev-mode-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dev-badge {
  background: var(--color-primary);
  color: #ffffff;
  font-size: var(--fs-meta);
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  box-shadow: var(--shadow-sm);
}

.dev-select-row {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.dev-select {
  flex: 1;
  font-size: 0.7875rem;
  padding: 0.55rem 0.85rem;
}

.impersonate-trigger-btn {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: 1px solid var(--color-primary);
  padding: 0.55rem 1.1rem;
  border-radius: var(--radius-sm);
  font-size: 0.7875rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.impersonate-trigger-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--color-primary);
}

.impersonate-trigger-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.impersonating-active-banner {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid var(--color-danger);
  padding: 0.85rem 1rem;
  border-radius: 10px;
}

.banner-text {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.7875rem;
  color: var(--text-primary);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-danger);
  box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
  animation: pulse-red 1.6s infinite;
}

@keyframes pulse-red {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(220, 38, 38, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
  }
}

.stop-impersonate-btn {
  background: var(--color-danger);
  color: #ffffff;
  border: 1px solid var(--color-danger);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.7625rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.stop-impersonate-btn:hover {
  background: var(--bg-hover);
  color: var(--color-danger);
}

/* ========= PROFILE PANEL ========= */
.profile-avatar-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.avatar-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  /* border: 1px solid rgba(239, 68, 68, 0.25); */
  color: var(--color-danger);
  font-size: 0.7375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.logout-btn:hover {
  background: var(--color-danger);
  color: #ffffff;
  border-color: var(--color-danger);
}

.avatar-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-letter {
  font-family: var(--font-title);
  font-size: var(--fs-h2);
  font-weight: var(--fw-bold);
  color: #fff;
}

.avatar-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.avatar-nickname {
  font-size: var(--fs-h3);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
}

.avatar-handle {
  font-size: var(--fs-caption);
  color: var(--text-muted);
}

.profile-separator {
  height: 1px;
  background: var(--border-color);
}

/* Form */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field-label {
  font-size: var(--fs-caption);
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.field-hint {
  font-size: var(--fs-tiny);
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.field-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-input-wrap input {
  width: 100%;
  padding: 0.55rem 0.75rem;
  padding-right: 2.5rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--fs-body);
  color: var(--text-primary);
  cursor: text;
}

.field-input-wrap.locked-wrap input,
.field-input-wrap input[readonly] {
  color: var(--text-muted);
  cursor: not-allowed;
  background: rgba(128, 128, 128, 0.06);
}

.lock-indicator {
  position: absolute;
  right: 0.75rem;
  color: var(--text-muted);
  display: flex;
}

.field-input {
  width: 100%;
  padding: 0.55rem 0.85rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--fs-body);
  color: var(--text-primary);
  transition: border-color 0.18s ease;
}

.field-input::placeholder {
  color: var(--text-muted);
  opacity: 0.75;
}

.field-input:focus {
  border-color: var(--color-primary);
  outline: none;
}


.save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: var(--color-primary);
  color: #fff;
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.save-btn:disabled {
  background: rgba(128, 128, 128, 0.1);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  cursor: not-allowed;
}


/* ========= THEME PANEL ========= */
.theme-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Light themes first, dark themes second. */
.theme-panel .theme-group:nth-child(2) {
  order: 3;
}

.theme-panel .theme-group:nth-child(3) {
  order: 2;
}

.theme-group-label {
  font-size: var(--fs-caption);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--border-color);
}

.theme-cards-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.theme-card {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
  position: relative;
}

.theme-card:hover {
  border-color: var(--border-color-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.theme-card.selected {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  background: var(--bg-elevated);
}

/* Mini Preview */
.theme-preview {
  height: 90px;
  display: flex;
  overflow: hidden;
  margin: 8px 8px 0 8px;
  border-radius: 8px;
  border: 1px solid rgba(128, 128, 128, 0.15);
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
}

.preview-sidebar {
  width: 26%;
  min-width: 26%;
}

.preview-body {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-line {
  height: 4px;
  border-radius: 2px;
}

.preview-line.long {
  width: 75%;
}

.preview-line.short {
  width: 45%;
}

.preview-cards-row {
  display: flex;
  gap: 5px;
  margin-top: auto;
}

.preview-mini-card {
  flex: 1;
  height: 22px;
  border-radius: 4px;
  border: 1px solid;
}

/* Theme footer */
.theme-card-footer {
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.theme-name-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.theme-name-wrap h4 {
  font-size: 0.8575rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

@media (max-width: 1366px) {
  .theme-cards-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1132px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .theme-cards-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .theme-cards-row {
    grid-template-columns: 1fr;
  }
}



/* ========= GOOGLE SHEETS PANEL ========= */
.sheets-panel {
  margin-top: 1.5rem;
}

.connection-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 0.25rem;
  background: var(--text-muted);
}
.connection-dot.connected {
  background: var(--color-success);
}
.connection-dot.error {
  background: var(--color-error);
}
.connection-dot.unknown {
  background: var(--text-muted);
}

.connection-label {
  font-size: var(--fs-caption);
  color: var(--text-muted);
}

.sheets-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sheets-url-row {
  display: flex;
  gap: 0.75rem;
  align-items: stretch;
  margin-top: 0.5rem;
}

.sheets-url-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
}

.sheets-url-wrap.locked input {
  opacity: 0.75;
  cursor: not-allowed;
  padding-right: 2.2rem;
  background: var(--bg-hover);
}

.sheets-url-input {
  width: 100%;
  font-size: 0.7375rem;
  font-family: monospace;
}


.test-btn {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  padding: 0.6rem 1rem;
  border-radius: 10px;
  font-size: 0.7575rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  color: var(--text-primary);
}
.test-btn:hover:not(:disabled) {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}
.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sheets-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.sync-info {
  flex: 1;
}

.sync-time {
  font-size: var(--fs-caption);
  color: var(--text-muted);
}

.sheets-btns {
  display: flex;
  gap: 0.75rem;
}

.sheets-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  font-size: 0.7875rem;
  font-weight: 600;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
.sheets-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.sheets-btn.primary {
  background: var(--glow-primary);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}
.sheets-btn.primary:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
}
.sheets-btn.secondary {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.sheets-btn.secondary:hover:not(:disabled) {
  background: var(--color-secondary);
  border-color: var(--color-secondary);
  color: white;
}

.sync-message {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.7875rem;
  line-height: 1.5;
}
.id-login-form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.id-login-form .locked-wrap {
  flex: 1;
}

.account-select {
  cursor: pointer;
}

.id-login-btn {
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: 1px solid var(--color-primary);
  font-size: 0.7575rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
  cursor: pointer;
}

.id-login-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--color-primary);
}

.id-login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sync-message.success {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.locked-wrap,
.password-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.lock-toggle-btn,
.password-toggle-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.7375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0.2rem;
  transition: color 0.2s ease;
  z-index: 2;
}

.lock-toggle-btn:hover:not(:disabled),
.password-toggle-btn:hover:not(:disabled) {
  color: var(--text-primary);
}

.lock-toggle-btn:disabled,
.lock-toggle-btn.disabled,
.password-toggle-btn:disabled,
.password-toggle-btn.disabled {
  opacity: 0.25;
  pointer-events: none;
}

/* 管理成員觸發按鈕 (Personal Settings Panel) */
.manage-users-block {
  margin-top: 0.5rem;
}

.manage-users-trigger-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-color-hover);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 0.8175rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.manage-users-trigger-btn:hover {
  background: var(--glow-primary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.user-count-badge {
  background: var(--glow-primary);
  color: var(--color-primary);
  font-size: var(--fs-meta);
  font-weight: 700;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
}

/* Auth Modal & User Management Modal (100% 連動當前 Appearance 主題色) */
/* Auth Modal & User Management Modal (100% 連動當前 Appearance 主題色) */
.auth-modal,
.user-mgmt-modal {
  background: var(--bg-elevated);
  border: 1px solid color-mix(in srgb, var(--border-color) 70%, transparent);
  color: var(--text-primary);
  box-shadow: var(--shadow-lg);
  border-radius: var(--modal-radius);
  max-height: var(--modal-max-height);
}

/* 標頭對齊與隔線 */
.auth-modal .modal-header,
.user-mgmt-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--border-color);
}

.auth-modal .modal-header h3,
.user-mgmt-modal .modal-header h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auth-modal .close-btn,
.user-mgmt-modal .close-btn {
  width: var(--modal-control-size);
  height: var(--modal-control-size);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  font-size: 1.188rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.2rem;
  line-height: 1;
  transition: color 0.18s ease;
}

.auth-modal .close-btn:hover,
.user-mgmt-modal .close-btn:hover {
  color: var(--text-primary);
}

.auth-modal .close-btn:focus-visible,
.user-mgmt-modal .close-btn:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

/* 底部對齊與隔線 */
.auth-modal .modal-footer,
.user-mgmt-modal .modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

/* User Management Modal 特殊佈局 */
.user-mgmt-modal {
  width: 92%;
  max-width: 620px;
  border-radius: var(--modal-radius);
  padding: 1.5rem;
  margin: auto;
  max-height: var(--modal-max-height);
}

.user-mgmt-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.um-section-box {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.um-section-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

/* 新增成員 4 欄 Grid (暱稱 + 帳號 ID + 身分選單 + 按鈕) */
.add-user-modal-form {
  display: grid;
  grid-template-columns: 1fr 1fr 1.15fr auto;
  gap: 0.6rem;
  align-items: center;
}

.add-user-modal-form .field-input,
.add-user-modal-form .role-select {
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.85rem;
  font-size: 0.7875rem;
  transition: border-color 0.18s ease;
}

.add-user-modal-form .field-input::placeholder {
  color: var(--text-muted);
  opacity: 0.85;
}

.add-user-modal-form .field-input:focus,
.add-user-modal-form .role-select:focus {
  border-color: var(--color-primary);
  outline: none;
}

.role-select {
  cursor: pointer;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.role-select option {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.add-member-btn {
  padding: 0.55rem 1.15rem;
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: var(--color-on-primary);
  font-size: 0.7575rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.add-member-btn:hover {
  background: var(--bg-hover);
  color: var(--color-primary);
}

/* 成員清單：極簡扁平 List 視圖 (無獨立卡片粗框) */
.user-modal-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  overflow: hidden;
  max-height: 280px;
  overflow-y: auto;
}

.user-modal-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-color);
  border-radius: 0;
  transition: background-color 0.15s ease;
}

.user-modal-card:last-child {
  border-bottom: none;
}

.user-modal-card:hover {
  background: var(--bg-hover);
}

.user-modal-card:hover .user-modal-name {
  color: var(--color-primary);
}

.user-modal-card:hover .user-avatar-sm {
  background: var(--color-primary);
  color: #ffffff;
}

.user-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--glow-primary);
  color: var(--color-primary);
  font-weight: 700;
  font-size: 0.7875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.user-modal-info {
  display: flex;
  gap: 1rem;
  flex: 1;
  line-height: 1;
}

.user-modal-name {
  font-size: 0.8175rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-modal-handle {
  font-size: 0.6975rem;
  color: var(--text-muted);
  font-family: monospace;
}

.user-modal-right {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

/* 自訂成員排序按鈕群 (⬆️ 上移 / ⬇️ 下移) */
.user-reorder-btns {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-right: 0.25rem;
}

.order-btn {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 4px;
  width: 22px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.order-btn:hover:not(:disabled) {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
  transform: scale(1.08);
}

.order-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}




.nickname-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}


.admin-crown-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.15rem;
}

.crown-icon-svg {
  width: 14px;
  height: 14px;
  stroke: var(--color-warning);
  fill: color-mix(in srgb, var(--color-warning) 20%, transparent);
  filter: drop-shadow(0 0 3px color-mix(in srgb, var(--color-warning) 35%, transparent));
  transition: transform 0.2s ease;
}

.crown-icon-svg.micro {
  width: 11px;
  height: 11px;
  margin-right: 3px;
}

.admin-crown-wrap:hover .crown-icon-svg {
  transform: scale(1.2);
}


.user-management-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.um-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.um-title {
  font-size: 0.8575rem;
  font-weight: 700;
  color: var(--color-primary);
}

.um-count {
  font-size: 0.7175rem;
  color: var(--text-muted);
}

.add-user-form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.add-user-inputs {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.field-input.sm {
  padding: 0.45rem 0.75rem;
  font-size: 0.7575rem;
}

.add-user-btn {
  padding: 0.45rem 0.9rem;
  background: var(--glow-primary);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 8px;
  font-size: 0.7375rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.add-user-btn:hover {
  background: var(--color-primary);
  color: #ffffff;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 220px;
  overflow-y: auto;
}

.user-item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.85rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.user-name {
  font-size: 0.7875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-id {
  font-size: 0.7175rem;
  color: var(--text-muted);
  font-family: monospace;
}

.user-role-tag {
  font-size: 0.6175rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}
.user-role-tag.admin {
  background: var(--glow-primary);
  color: var(--color-primary);
}
.user-role-tag.user {
  background: var(--bg-subtle);
  color: var(--text-secondary);
}

.del-user-btn {
  background: transparent;
  border: none;
  font-size: 0.7875rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.del-user-btn:hover {
  opacity: 1;
}

.name-badge-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}




.role-badge {
  font-size: var(--fs-meta);
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
}
.role-badge.admin {
  background: var(--glow-primary);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
.role-badge.user {
  background: var(--bg-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.admin-access-block {
  margin-top: 0.5rem;
}

.admin-unlock-box {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.admin-hint {
  font-size: 0.7375rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.unlock-admin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--bg-elevated);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.7875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.unlock-admin-btn:hover {
  background: var(--color-primary);
  color: white;
}

.admin-unlocked-panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color-hover);
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.unlocked-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unlocked-title {
  font-size: 0.7875rem;
  font-weight: 700;
  color: var(--color-primary);
}

.lock-btn {
  font-size: var(--fs-meta);
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

/* Auth Modal (管理者驗證彈窗) */
.auth-modal {
  width: 90%;
  max-width: 440px;
  background: var(--bg-card);
  border: 1px solid var(--border-color-hover);
  border-radius: var(--modal-radius);
  padding: 1.75rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  margin: auto;
  display: flex;
  flex-direction: column;
}

.auth-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--border-color);
}

.auth-modal .modal-header h3 {
  font-size: 1.038rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auth-modal .close-btn {
  background: transparent;
  border: none;
  font-size: 1.188rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.2rem;
  line-height: 1;
  transition: color 0.2s ease;
}

.auth-modal .close-btn:hover {
  color: var(--text-primary);
}

.auth-modal .modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-desc {
  font-size: 0.8175rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

.auth-desc code {
  color: var(--color-primary);
  font-weight: 600;
}

.auth-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 0.8875rem;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.auth-input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.auth-error-msg {
  color: #ef4444;
  font-size: 0.7575rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.auth-modal .modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.auth-modal .cancel-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.7875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.auth-modal .cancel-btn:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.auth-modal .submit-btn {
  padding: 0.55rem 1.3rem;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: var(--color-on-primary);
  font-size: 0.7875rem;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.auth-modal .submit-btn:hover {
  background: var(--bg-hover);
  color: var(--color-primary);
}


.sync-message.info {
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .add-user-modal-form {
    flex-direction: column;
    align-items: stretch;
  }
  .add-user-modal-form .field-input,
  .add-user-modal-form .role-select,
  .add-user-modal-form .add-member-btn {
    width: 100%;
  }
  .user-modal-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .user-modal-right {
    width: 100%;
    justify-content: space-between;
  }
  .user-mgmt-modal,
  .auth-modal {
    width: 95%;
    padding: 1.25rem 1rem;
  }
}
</style>
