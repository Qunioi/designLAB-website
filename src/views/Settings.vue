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

          <p v-if="loginErrorMsg" class="auth-error-msg" style="margin-top: var(--space-1);">⚠️ {{ loginErrorMsg }}</p>

          <button type="submit" class="save-btn" :disabled="isLoggingIn || !quickInputID.trim() || !quickInputPassword.trim()">
            <svg v-if="isLoggingIn" class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" stroke="none" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            {{ isLoggingIn ? '登入中...' : '登入帳號' }}
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
                          class="del-user-btn reset-pass-btn"
                          @click="handleResetPassword(p.username)"
                          title="重設為臨時密碼 123456，該成員下次登入需強制變更"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </button>
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

                <div class="field-group" style="margin-bottom: var(--space-3);">
                  <label class="field-label">原密碼 (Current Password)</label>
                  <input 
                    v-model="oldPasswordInput" 
                    type="password" 
                    placeholder="請輸入原密碼 (預設: 123456)" 
                    class="field-input" 
                  />
                </div>

                <div class="field-group" style="margin-bottom: var(--space-3);">
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import NotificationBell from '../components/NotificationBell.vue';

import {
  getUserProfiles,
  getCurrentUser,
  setCurrentUser,
  loginByAccountID,
  logout as logoutUser,
  isSuperAdminUser,
  addUserProfile,
  removeUserProfile,
  adminResetPassword,
  reorderUserProfiles,
  getImpersonatorStatus,
  impersonateUser,
  stopImpersonating,
  updateUserPassword
} from '../utils/userStore';

const targetImpersonateUser = ref('');
const impersonatorInfo = ref(getImpersonatorStatus());
const isImpersonating = computed(() => impersonatorInfo.value.isImpersonating);

// 身分模擬區塊僅對最高管理員 (Super Admin) 顯示（或正處於模擬狀態中時，方便看到「退出模擬」）；
// 一律以伺服器記錄的角色為準，不再有任何帳號名稱字串可以取得這塊 UI。
const isDeveloperAccount = computed(() => isImpersonating.value || isSuperAdminUser());

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

const handleAddUser = async () => {
  if (!newUserNickname.value.trim() || !newUsername.value.trim()) return;
  try {
    await addUserProfile({
      nickname: newUserNickname.value,
      username: newUsername.value,
      role: newUserRole.value
    });
    newUserNickname.value = '';
    newUsername.value = '';
    newUserRole.value = 'USER';
    refreshProfiles();
    alert('成功新增成員並同步至 Google Sheets USERS 分頁！臨時密碼為 123456，該成員首次登入需強制變更密碼。');
  } catch (err) {
    alert(err.message || '新增成員失敗！');
  }
};


const handleDeleteUser = async (targetUsername) => {
  if (!confirm(`確定要刪除成員 ${targetUsername} 嗎？`)) return;
  try {
    await removeUserProfile(targetUsername);
    refreshProfiles();
    alert('已成功刪除該成員！');
  } catch (err) {
    alert(err.message || '刪除成員失敗！');
  }
};

const handleResetPassword = async (targetUsername) => {
  if (!confirm(`確定要將 ${targetUsername} 的密碼重設為臨時密碼 123456 嗎？\n該成員下次登入時將被強制要求變更密碼。`)) return;
  const result = await adminResetPassword(targetUsername);
  if (result.success) {
    alert(`已將 ${targetUsername} 的密碼重設為臨時密碼 123456，請通知該成員盡快登入並修改密碼。`);
  } else {
    alert(result.error || '重設密碼失敗！');
  }
};


// 是否為管理員（Super Admin / Admin）：一律以目前登入 Session 對應的伺服器角色為準，
// 不再有任何帳號名稱字串可以繞過此判斷。
const isAdmin = computed(() => {
  const role = (getCurrentUser().role || '').toLowerCase();
  return role === 'super admin' || role === 'admin';
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

const handleChangePasswordSubmit = async () => {
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

  const result = await updateUserPassword(props.username, oldPasswordInput.value, newPasswordInput.value);
  if (result.success) {
    alert('密碼修改成功！新密碼已儲存。');
    showChangePassModal.value = false;
    mustChangePassword.value = false;
  } else {
    passErrorMsg.value = result.error || '密碼修改失敗！';
  }
};

const handleLogout = async () => {
  showUserMgmtModal.value = false;
  const u = await logoutUser();
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

// 登入成功但伺服器標示「必須變更密碼」時（例如新帳號的臨時密碼、或管理員重設過），
// 強制先跳出修改密碼視窗，避免使用者一直用臨時密碼 123456 登入。
const mustChangePassword = ref(false);
const isLoggingIn = ref(false);

const handleQuickIDLogin = async () => {
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

  isLoggingIn.value = true;
  const res = await loginByAccountID(input, pass);
  isLoggingIn.value = false;

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

    if (res.mustChangePassword) {
      mustChangePassword.value = true;
      openChangePasswordModal();
      passErrorMsg.value = '首次登入請先變更密碼（原密碼為臨時密碼 123456）。';
    }
  }
};

const isNicknameChanged = computed(() => {
  const currentNick = (localNickname.value || '').trim();
  const propNick = (props.nickname || '').trim();
  return currentNick !== '' && currentNick !== propNick;
});

const saveProfile = () => {
  const nick = (localNickname.value || '').trim();
  if (nick !== '') {
    const user = setCurrentUser(nick, props.username || '@quni_jhuang');
    refreshProfiles();
    emit('update-user', user);
    emit('update-nickname', user.nickname);
  }
};



onMounted(() => {
  refreshProfiles();
});

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
  gap: var(--space-4);
}

/* Main layout: profile left, themes right */
.settings-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: var(--space-4);
  align-items: start;
}

/* Panel shared style */
.settings-panel {
  padding: var(--space-7);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.panel-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
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
  margin-top: var(--space-4);
}

.dev-mode-box {
  background: var(--glow-primary);
  border: 1px dashed var(--color-primary);
  border-radius: 12px;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.dev-mode-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.dev-badge {
  background: var(--color-primary);
  color: #ffffff;
  font-size: var(--fs-meta);
  font-weight: var(--fw-bold);
  padding: var(--space-1) var(--space-2);
  border-radius: 99px;
  box-shadow: var(--shadow-sm);
}

.dev-select-row {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.dev-select {
  flex: 1;
  font-size: var(--fs-label);
  padding: var(--space-2) var(--space-3);
}

.impersonate-trigger-btn {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: 1px solid var(--color-primary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-size: var(--fs-label);
  font-weight: var(--fw-bold);
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
  gap: var(--space-3);
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid var(--color-danger);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
}

.banner-text {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-label);
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
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-size: var(--fs-meta);
  font-weight: var(--fw-bold);
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
  gap: var(--space-4);
}

.avatar-user-info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  /* border: 1px solid rgba(239, 68, 68, 0.25); */
  color: var(--color-danger);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
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
  gap: var(--space-1);
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
  gap: var(--space-2);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
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
  margin-bottom: var(--space-1);
}

.field-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-input-wrap input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
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

.field-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
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
  gap: var(--space-2);
  background: var(--color-primary);
  color: #fff;
  padding: var(--space-2) var(--space-4);
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
  gap: var(--space-3);
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
  /* font-weight 跟 h3 本身的規則一樣是 --fw-semibold，不重複寫 */
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  padding-bottom: var(--space-1);
  border-bottom: 1px solid var(--border-color);
}

.theme-cards-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
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
  box-shadow: var(--shadow-inset);
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
  border-radius: var(--radius-xs);
  border: 1px solid;
}

/* Theme footer */
.theme-card-footer {
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
}

.theme-name-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
}

.theme-name-wrap h4 {
  font-size: var(--fs-body);
  font-weight: var(--fw-bold);
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
  font-size: var(--fs-meta);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: var(--space-1);
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
  margin-top: var(--space-2);
}

.manage-users-trigger-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-hover);
  border: 1px solid var(--border-color-hover);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--fs-label);
  font-weight: var(--fw-semibold);
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
  font-weight: var(--fw-bold);
  padding: var(--space-1) var(--space-2);
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
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-color);
}

.auth-modal .modal-header h3,
.user-mgmt-modal .modal-header h3 {
  font-size: var(--fs-h3);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
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
  font-size: var(--fs-h2);
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--space-1);
  line-height: var(--lh-none);
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
  gap: var(--space-3);
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-color);
}

/* User Management Modal 特殊佈局 */
.user-mgmt-modal {
  width: 92%;
  max-width: 620px;
  border-radius: var(--modal-radius);
  padding: var(--space-6);
  margin: auto;
  max-height: var(--modal-max-height);
}

.user-mgmt-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  overflow-y: auto;
  padding-right: var(--space-1);
}

.um-section-box {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.um-section-label {
  font-size: var(--fs-meta);
  font-weight: var(--fw-bold);
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

/* 新增成員 4 欄 Grid (暱稱 + 帳號 ID + 身分選單 + 按鈕) */
.add-user-modal-form {
  display: grid;
  grid-template-columns: 1fr 1fr 1.15fr auto;
  gap: var(--space-2);
  align-items: center;
}

.add-user-modal-form .field-input,
.add-user-modal-form .role-select {
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-label);
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
  padding: var(--space-2) var(--space-5);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: var(--color-on-primary);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
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
  padding: var(--space-2) var(--space-3);
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

.user-modal-info {
  display: flex;
  gap: var(--space-4);
  flex: 1;
  line-height: var(--lh-none);
}

.user-modal-name {
  font-size: var(--fs-label);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.user-modal-handle {
  font-size: var(--fs-tiny);
  color: var(--text-muted);
  font-family: monospace;
}

.user-modal-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* 自訂成員排序按鈕群 (⬆️ 上移 / ⬇️ 下移) */
.user-reorder-btns {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-right: var(--space-1);
}

.order-btn {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: var(--radius-xs);
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
  gap: var(--space-1);
}


.admin-crown-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: var(--space-1);
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


.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.user-role-tag {
  font-size: var(--fs-tiny);
  font-weight: var(--fw-semibold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-xs);
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
  font-size: var(--fs-label);
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.del-user-btn:hover {
  opacity: 1;
}

.reset-pass-btn:hover {
  color: var(--color-primary);
}


/* Auth Modal (管理者驗證彈窗)：容器本身的底色/邊框/尺寸跟
   User Management Modal 不一樣（見下面單獨這條），標頭／關閉鈕的樣式
   已經跟 User Management Modal 共用同一份（在 .auth-modal, .user-mgmt-modal
   那組規則裡），這裡不重複寫。 */
.auth-modal {
  width: 90%;
  max-width: 440px;
  background: var(--bg-card);
  border: 1px solid var(--border-color-hover);
  border-radius: var(--modal-radius);
  padding: var(--space-7);
  box-shadow: var(--shadow-lg);
  margin: auto;
  display: flex;
  flex-direction: column;
  color: var(--text-primary);
  max-height: var(--modal-max-height);
}

.auth-modal .modal-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.auth-desc {
  font-size: var(--fs-label);
  color: var(--text-secondary);
  line-height: var(--lh-normal);
}

.auth-desc code {
  color: var(--color-primary);
  font-weight: var(--fw-semibold);
}

.auth-error-msg {
  color: #ef4444;
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* 其餘 modal-footer 樣式跟 User Management Modal 共用，這裡只有
   margin-top 特別留大一點（space-6 而不是共用版的 space-5） */
.auth-modal .modal-footer {
  margin-top: var(--space-6);
}

.auth-modal .cancel-btn {
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-md);
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: var(--fs-label);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.auth-modal .cancel-btn:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.auth-modal .submit-btn {
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: var(--color-on-primary);
  font-size: var(--fs-label);
  font-weight: var(--fw-semibold);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.auth-modal .submit-btn:hover {
  background: var(--bg-hover);
  color: var(--color-primary);
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
    gap: var(--space-2);
  }
  .user-modal-right {
    width: 100%;
    justify-content: space-between;
  }
  .user-mgmt-modal,
  .auth-modal {
    width: 95%;
    padding: var(--space-5) var(--space-4);
  }
}
</style>
