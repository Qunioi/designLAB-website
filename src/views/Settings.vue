<template>
  <div class="settings-view">
    <PageHeader
      title="系統與個人設定"
      subtitle="管理您的顯示暱稱、團隊成員權限、雲端資料庫同步與 8 套視覺主題"
    />

    <div class="settings-layout">
      <section class="settings-panel glass-panel profile-panel">
        <div class="panel-label">
          <Icon name="user" :size="16" />
          <span>Profile</span>
        </div>

        <div class="profile-avatar-area">
          <div class="avatar-user-info">
            <div class="avatar-circle" :class="{ 'admin-circle': isAdmin }">
              <span class="avatar-letter">{{ (nickname || '訪').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="avatar-meta">
              <div class="nickname-row">
                <span class="avatar-nickname">{{ nickname || '訪客' }}</span>
                <span v-if="isAdmin" class="admin-crown-wrap" title="管理員">
                  <Icon name="crown" :size="14" class="crown-icon-svg" />
                </span>
              </div>
              <span class="avatar-handle">{{ username || '@account' }}</span>
            </div>
          </div>

          <button 
            v-if="isLoggedIn" 
            type="button" 
            class="logout-btn" 
            @click="handleLogout" 
            title="登出目前帳號"
          >
            <Icon name="logout" :size="13" />
          </button>
        </div>

        <div class="profile-separator"></div>

        <form v-if="!isLoggedIn" @submit.prevent="handleQuickIDLogin" class="profile-form">
          <!-- 權杖已失效：明講原因，否則使用者只會看到登出鍵消失、登入框冒出來 -->
          <p v-if="isSessionExpired" class="session-expired-notice">
            <Icon name="alert-circle" :size="14" />
            <span>登入已逾期，雲端儲存功能暫時無法使用。請重新輸入帳號密碼登入，登入後即可正常儲存。</span>
          </p>
          <FormField id="settings-login-id" label="ACCOUNT ID" v-slot="{ id }">
            <div class="field-input-wrap">
                <input 
                  :id="id" 
                  v-model="quickInputID" 
                  type="text" 
                  placeholder="account" 
                  class="field-input" 
                  autocomplete="username"
                />
            </div>
          </FormField>

          <FormField id="settings-login-password" label="PASSWORD" v-slot="{ id }">
            <div class="field-input-wrap password-wrap">
                <input 
                  :id="id" 
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
                  <Icon name="eye-off" :size="14" v-if="showLoginPassword" />
                  <Icon name="eye" :size="14" v-else />
                </button>
            </div>
          </FormField>

          <p v-if="loginErrorMsg" class="auth-error-msg" style="margin-top: var(--space-1);">⚠️ {{ loginErrorMsg }}</p>

          <BaseButton type="submit" size="lg" block :loading="isLoggingIn" loading-text="登入中…" :disabled="!quickInputID.trim() || !quickInputPassword.trim()">
            <template #icon><Icon name="login" :size="14" /></template>
            登入帳號
          </BaseButton>
        </form>

        <form v-else @submit.prevent="saveProfile" class="profile-form">
          <FormField id="settings-account-id" label="ACCOUNT ID (帳號 ID)" description="由管理員於 Google Sheets 建立。點擊右側鑰匙圖示修改密碼。" v-slot="{ id, describedby }">
            <div class="field-input-wrap locked-wrap">
                <input :id="id" :aria-describedby="describedby" :value="username" type="text" class="field-input" readonly />
                <button 
                  type="button" 
                  class="lock-toggle-btn" 
                  @click="openChangePasswordModal" 
                  title="點擊修改個人登入密碼"
                >
                  <Icon name="lock" :size="14" />
                </button>
            </div>
          </FormField>

          <FormField id="settings-nickname" label="NICKNAME (顯示暱稱)" description="您在 Design LAB 各項目的顯示暱稱。" v-slot="{ id, describedby }">
            <input :id="id" :aria-describedby="describedby" v-model="localNickname" type="text" placeholder="Enter nickname" class="field-input" required />
          </FormField>

          <BaseButton type="submit" block :loading="savingNickname" :disabled="!isNicknameChanged">
            <template #icon><Icon name="check" :size="14" /></template>
            儲存暱稱修改
          </BaseButton>
        </form>

        <div v-if="isAdmin" class="manage-users-block">
          <div class="profile-separator"></div>
          <BaseButton variant="secondary" block @click="showUserMgmtModal = true">
            <template #icon><Icon name="users" :size="15" /></template>
            團隊成員管理
            <template #end><span class="user-count-badge">{{ (userProfiles && userProfiles.length) ? userProfiles.length : 0 }}</span></template>
          </BaseButton>
        </div>

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
              <BaseButton variant="danger" size="sm" @click="handleStopImpersonate">
                退出模擬 (返回 Quni)
              </BaseButton>
            </div>

            <div v-else class="dev-select-row">
              <Select v-model="targetImpersonateUser" class="dev-select" :options="impersonateOptions" placeholder="請選擇要模擬切換的帳號" aria-label="要模擬切換的帳號" menu-title="模擬切換為" />
              <BaseButton :disabled="!targetImpersonateUser" @click="handleStartImpersonate">
                模擬切換
              </BaseButton>
            </div>
          </div>
        </div>

        <BaseModal
          :open="showUserMgmtModal"
          size="md"
          panel-class="user-mgmt-modal"
          close-label="關閉團隊成員管理"
          @close="showUserMgmtModal = false"
        >
          <template #header>
            <Icon name="crown" :size="16" class="crown-icon-svg" />
            <span>團隊成員管理</span>
          </template>

              <div class="base-modal-body user-mgmt-body">
                <div class="um-section-box">
                  <p id="add-member-heading" class="um-section-label">新增成員帳號與設定身分</p>
                  <form @submit.prevent="handleAddUser" class="add-user-modal-form" aria-labelledby="add-member-heading">
                    <input v-model="newUserNickname" aria-label="顯示暱稱" type="text" placeholder="顯示暱稱 (如: Alex)" class="field-input" required />
                    <input v-model="newUsername" aria-label="帳號 ID" type="text" placeholder="帳號 ID (如: @alex)" class="field-input" required />
                    <Select v-model="newUserRole" class="role-select" :options="ROLE_OPTIONS" aria-label="身分" />
                    <BaseButton type="submit" class="add-member-btn" :loading="isAddingUser" loading-text="新增中…">+ 新增成員</BaseButton>
                  </form>
                </div>

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
                        <div class="user-reorder-btns">
                          <button
                            type="button"
                            class="order-btn"
                            :disabled="index === 0 || reorderingUserIndex !== -1"
                            @click="handleMoveUser(index, -1)"
                            title="向上移動成員順序"
                          >
                            <Spinner v-if="reorderingUserIndex === index" :size="12" />
                            <Icon name="chevron-up" :size="12" :stroke-width="2.5" v-else />
                          </button>
                          <button
                            type="button"
                            class="order-btn"
                            :disabled="index === userProfiles.length - 1 || reorderingUserIndex !== -1"
                            @click="handleMoveUser(index, 1)"
                            title="向下移動成員順序"
                          >
                            <Spinner v-if="reorderingUserIndex === index" :size="12" />
                            <Icon name="chevron-down" :size="12" :stroke-width="2.5" v-else />
                          </button>
                        </div>

                        <Chip variant="status" :tone="isAdminRole(p.role) ? 'primary' : 'neutral'">{{ roleLabel(p.role) }}</Chip>
                        <IconButton
                          icon="lock"
                          size="sm"
                          label="重設為臨時密碼 123456，該成員下次登入需強制變更"
                          :loading="resettingUsername === p.username"
                          :disabled="deletingUsername === p.username"
                          @click="handleResetPassword(p.username)"
                        />
                        <IconButton
                          v-if="!isAdminRole(p.role) && p.username !== '@quni_jhuang' && p.username !== '@ray_zhao'"
                          icon="trash-2"
                          size="sm"
                          variant="delete"
                          :label="`刪除成員 ${p.nickname}`"
                          :loading="deletingUsername === p.username"
                          :disabled="resettingUsername === p.username"
                          @click="handleDeleteUser(p.username)"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

          <template #footer>
            <BaseButton variant="secondary" @click="showUserMgmtModal = false">關閉</BaseButton>
          </template>
        </BaseModal>

        <BaseModal
          :open="showChangePassModal"
          size="sm"
          panel-class="auth-modal"
          close-label="關閉修改密碼"
          @close="showChangePassModal = false"
        >
          <template #header>
            <Icon name="lock" :size="16" />
            <span>修改個人密碼 (Change Password)</span>
          </template>

              <div class="base-modal-body auth-modal-body">
                <p class="auth-desc">修改帳號 <code>{{ username }}</code> 的個人登入密碼：</p>

                <FormField id="settings-old-password" label="原密碼 (Current Password)" v-slot="{ id }">
                  <input
                      :id="id" 
                      v-model="oldPasswordInput" 
                      type="password" 
                      placeholder="請輸入原密碼 (預設: 123456)" 
                      class="field-input" 
                    />
                </FormField>

                <FormField id="settings-new-password" label="新密碼 (New Password)" v-slot="{ id }">
                  <input
                      :id="id" 
                      v-model="newPasswordInput" 
                      type="password" 
                      placeholder="請輸入新密碼" 
                      class="field-input" 
                    />
                </FormField>

                <FormField id="settings-confirm-password" label="確認新密碼 (Confirm New Password)" v-slot="{ id }">
                  <input
                      :id="id" 
                      v-model="confirmPasswordInput" 
                      type="password" 
                      placeholder="請再次輸入新密碼" 
                      class="field-input" 
                    />
                </FormField>

                <p v-if="passErrorMsg" class="auth-error-msg">⚠️ {{ passErrorMsg }}</p>
              </div>

          <template #footer>
            <BaseButton variant="secondary" @click="showChangePassModal = false">取消</BaseButton>
                <BaseButton :loading="isChangingPassword" loading-text="修改中…" @click="handleChangePasswordSubmit">確認修改密碼</BaseButton>
          </template>
        </BaseModal>

      </section>

      <section class="settings-panel glass-panel theme-panel">
        <div class="panel-label">
          <Icon name="palette" :size="16" />
          <span>Appearance</span>
        </div>

        <ThemePicker :model-value="currentTheme" @update:model-value="$emit('select-theme', $event)" />
      </section>
    </div>
  </div>
</template>

<script setup>
import ThemePicker from '../components/ThemePicker.vue';
import Chip from '../components/base/Chip.vue';
import Select from '../components/base/Select.vue';
import { toast } from '../utils/toast';
import { confirmDialog } from '../utils/confirm';
import BaseModal from '../components/base/BaseModal.vue';
import FormField from '../components/base/FormField.vue';
import IconButton from '../components/base/IconButton.vue';
import Icon from '../components/base/Icon.vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import BaseButton from '../components/base/BaseButton.vue';
import Spinner from '../components/base/Spinner.vue';
import { identityVersion } from '../utils/identity';
import PageHeader from '../components/PageHeader.vue';

import {
  getUserProfiles,
  getCurrentUser,
  setCurrentUser,
  loginByAccountID,
  logout as logoutUser,
  isSuperAdminUser,
  isAdminUser,
  hasActiveSession,
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

// 身分模擬只對 Super Admin（或正在模擬中）顯示，一律以伺服器記錄的角色為準
const isDeveloperAccount = computed(() => {
  identityVersion.value; // 登出／權杖過期／身分模擬切換時重新判斷
  props.username;
  return isImpersonating.value || isSuperAdminUser();
});

// 身分標籤只顯示 Admin／User；Super Admin 的權限照舊保留
const isAdminRole = (role) => /admin/i.test(role || '');
const roleLabel = (role) => (isAdminRole(role) ? 'Admin' : 'User');

const handleStartImpersonate = () => {
  if (!targetImpersonateUser.value) return;
  try {
    const targetUserObj = impersonateUser(targetImpersonateUser.value);
    impersonatorInfo.value = getImpersonatorStatus();
    emit('update-user', { nickname: targetUserObj.nickname, username: targetUserObj.username });
  } catch (e) {
    toast.error('無法切換模擬帳號', { detail: e.message });
  }
};

const handleStopImpersonate = () => {
  const result = stopImpersonating();
  impersonatorInfo.value = getImpersonatorStatus();
  targetImpersonateUser.value = '';
  emit('update-user', { nickname: result.nickname, username: result.username });
};

const reorderingUserIndex = ref(-1);
const handleMoveUser = async (index, delta) => {
  if (reorderingUserIndex.value !== -1) return;
  const targetIndex = index + delta;
  if (targetIndex < 0 || targetIndex >= userProfiles.value.length) return;
  reorderingUserIndex.value = index;
  try {
    const { profiles, synced } = reorderUserProfiles(index, targetIndex);
    userProfiles.value = profiles;
    const result = await synced;
    if (result && result.success === false) {
      // 同步失敗：userStore.js 已經把本機清單還原，這裡重新讀一次以反映還原後的順序。
      refreshProfiles();
    }
  } finally {
    reorderingUserIndex.value = -1;
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

// Token 過期時本機顯示身分不會消失，只看帳號會誤判成已登入、看不到登入表單（見 hasActiveSession()）
const isLoggedIn = computed(() => {
  identityVersion.value; // 登出／權杖過期／身分模擬切換時重新判斷
  return !!(props.username && props.username !== '@guest' && props.username !== 'guest' && props.username !== '@account' && hasActiveSession());
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

// 新增成員時可選的身分（選單不提供 Super Admin）
const ROLE_OPTIONS = [
  { value: 'User', label: '一般使用者 (User)' },
  { value: 'Admin', label: '管理員 (Admin)' }
];

// 開發者模擬切換的帳號清單：訪客＋所有成員，自己不能選
const impersonateOptions = computed(() => [
  { value: '@guest', label: '訪客 (@guest)' },
  ...(userProfiles.value || []).map(p => ({
    value: p.username,
    label: `${p.nickname} (${p.username})${isAdminRole(p.role) ? ' (管理員)' : ''}`,
    disabled: p.username === '@quni_jhuang'
  }))
]);

const showUserMgmtModal = ref(false);
const newUserNickname = ref('');
const newUsername = ref('');
const newUserRole = ref('User');

const isAddingUser = ref(false);
const handleAddUser = async () => {
  if (!newUserNickname.value.trim() || !newUsername.value.trim() || isAddingUser.value) return;
  isAddingUser.value = true;
  try {
    await addUserProfile({
      nickname: newUserNickname.value,
      username: newUsername.value,
      role: newUserRole.value
    });
    newUserNickname.value = '';
    newUsername.value = '';
    newUserRole.value = 'User';
    refreshProfiles();
    toast.success('已新增成員', { detail: '已同步到 Google Sheets。臨時密碼是 123456，對方第一次登入時會被要求改密碼。', duration: 6000 });
  } catch (err) {
    toast.error('新增成員失敗', { detail: err.message || '請稍後再試一次。' });
  } finally {
    isAddingUser.value = false;
  }
};

const deletingUsername = ref('');
const handleDeleteUser = async (targetUsername) => {
  if (deletingUsername.value) return;
  const ok = await confirmDialog({
    title: `刪除成員 ${targetUsername}？`,
    message: '對方將無法再登入 Design LAB。',
    confirmText: '刪除成員',
    danger: true
  });
  if (!ok) return;
  deletingUsername.value = targetUsername;
  try {
    await removeUserProfile(targetUsername);
    refreshProfiles();
    toast.success('已刪除成員', { detail: targetUsername });
  } catch (err) {
    toast.error('刪除成員失敗', { detail: err.message || '請稍後再試一次。' });
  } finally {
    deletingUsername.value = '';
  }
};

const resettingUsername = ref('');
const handleResetPassword = async (targetUsername) => {
  if (resettingUsername.value) return;
  const ok = await confirmDialog({
    title: `重設 ${targetUsername} 的密碼？`,
    message: '密碼會改成臨時密碼 123456，對方下次登入時會被要求改密碼。',
    confirmText: '重設密碼'
  });
  if (!ok) return;
  resettingUsername.value = targetUsername;
  try {
    const result = await adminResetPassword(targetUsername);
    if (result.success) {
      toast.success('已重設密碼', { detail: `${targetUsername} 的密碼已改成 123456，請通知對方盡快登入並修改。`, duration: 6000 });
    } else {
      toast.error('重設密碼失敗', { detail: result.error || '請稍後再試一次。' });
    }
  } finally {
    resettingUsername.value = '';
  }
};

// 以目前 Session 對應的伺服器角色為準；Session 過期時 isAdminUser() 回 false，管理功能一起收起。
// 依附 props.username：localStorage 不是響應式，身分模擬切換後才會重算。
const isAdmin = computed(() => {
  identityVersion.value; // 登出／權杖過期／身分模擬切換時重新判斷
  props.username;
  return isAdminUser();
});

// 還留著顯示身分、但沒有有效 Token＝登入已逾期，要明講原因
const isSessionExpired = computed(() => {
  identityVersion.value; // 登出／權杖過期／身分模擬切換時重新判斷
  return !!(props.username && props.username !== '@guest' && props.username !== 'guest' && props.username !== '@account' && !hasActiveSession());
});

const showChangePassModal = ref(false);
const isChangingPassword = ref(false);
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

  if (isChangingPassword.value) return;
  isChangingPassword.value = true;
  try {
    const result = await updateUserPassword(props.username, oldPasswordInput.value, newPasswordInput.value);
    if (result.success) {
      toast.success('密碼已修改');
      showChangePassModal.value = false;
      mustChangePassword.value = false;
    } else {
      passErrorMsg.value = result.error || '密碼修改失敗！';
    }
  } finally {
    isChangingPassword.value = false;
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

// 伺服器標示必須變更密碼時（臨時密碼、管理員重設過）強制先改密碼
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

const savingNickname = ref(false);
const saveProfile = async () => {
  const nick = (localNickname.value || '').trim();
  if (nick === '' || savingNickname.value) return;
  savingNickname.value = true;
  try {
    const user = setCurrentUser(nick, props.username || '@quni_jhuang');
    const result = await user.synced;
    if (result && result.success === false) {
      // 同步失敗時 setCurrentUser 已還原並提示，這裡不要樂觀更新暱稱
      return;
    }
    refreshProfiles();
    emit('update-user', user);
    emit('update-nickname', user.nickname);
  } finally {
    savingNickname.value = false;
  }
};

// 成員名單在雲端同步完成後才會更新：直接用網址進到設定頁時要跟著重讀
onMounted(() => {
  refreshProfiles();
  window.addEventListener('design-lab-storage-updated', refreshProfiles);
});
onUnmounted(() => {
  window.removeEventListener('design-lab-storage-updated', refreshProfiles);
});

</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-stack);
}

.settings-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr); /* minmax(0, …)：欄寬不被內容的最小寬度撐開 */
  gap: var(--grid-gap);
  align-items: start;
}

.settings-panel {
  padding: var(--panel-padding);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.panel-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.panel-label svg {
  opacity: 0.6;
}

.fade-enter-from, .fade-leave-to { opacity: 0; }

.dev-mode-block {
  margin-top: var(--space-4);
}

.dev-mode-box {
  background: var(--glow-primary);
  border: 1px dashed var(--color-primary);
  border-radius: var(--radius-md);
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
  background: var(--action-primary);
  color: var(--action-on-primary);
  font-size: var(--fs-meta);
  font-weight: var(--fw-bold);
  padding: var(--space-1) var(--space-4);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
}

.dev-select-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.dev-select {
  flex: 1;
  min-width: 0;
}

.impersonating-active-banner {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
  border: 1px solid var(--color-danger);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
}

.banner-text {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-body);
  color: var(--text-primary);
}

.pulse-dot {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--action-danger);
}

/* 往外擴散的光圈：只動 transform／opacity */
.pulse-dot::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--action-danger);
  animation: pulse-red 1.6s ease-out 3; /* 播 3 次就停，不無限閃爍 */
}

@keyframes pulse-red {
  from { transform: scale(1); opacity: 0.6; }
  to { transform: scale(2.5); opacity: 0; }
}

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
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
  color: var(--color-danger);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: background-color var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard);
}

.logout-btn:hover {
  background: var(--action-danger);
  color: var(--action-on-danger);
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
  font-size: var(--fs-glyph);
  font-weight: var(--fw-bold);
  color: var(--action-on-primary);
}

.avatar-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.avatar-nickname {
  font-size: var(--fs-section-title);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
}

.avatar-handle {
  font-size: var(--fs-meta);
  color: var(--text-muted);
}

.profile-separator {
  height: 1px;
  background: var(--border-color);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-hint {
  font-size: var(--fs-meta);
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
  background: var(--bg-subtle);
}

.field-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--fs-body);
  color: var(--text-primary);
  transition: border-color var(--dur-fast) var(--ease-standard);
}

.field-input::placeholder {
  color: var(--text-muted);
  opacity: 0.75;
}

.field-input:focus {
  border-color: var(--color-primary);
  outline: none;
}

@media (max-width: 1359px) {
  .settings-layout {
    grid-template-columns: minmax(0, 1fr);
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
  transition: color var(--dur-base) var(--ease-standard);
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

.manage-users-block {
  margin-top: var(--space-2);
}

.user-count-badge {
  background: var(--glow-primary);
  color: var(--color-primary);
  font-size: var(--fs-meta);
  font-weight: var(--fw-bold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
}

.user-mgmt-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.um-section-box {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background: var(--surface-card);
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

.add-user-modal-form {
  display: grid;
  grid-template-columns: 1fr 1fr 1.15fr auto;
  gap: var(--space-2);
  align-items: center;
}

.add-user-modal-form .field-input {
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-body);
  transition: border-color var(--dur-fast) var(--ease-standard);
}

.add-user-modal-form .field-input::placeholder {
  color: var(--text-muted);
  opacity: 0.85;
}

.add-user-modal-form .field-input:focus {
  border-color: var(--color-primary);
  outline: none;
}

.user-modal-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface-card);
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
  transition: background-color var(--dur-fast) var(--ease-standard);
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
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.user-modal-handle {
  font-size: var(--fs-meta);
  color: var(--text-muted);
  font-family: monospace;
}

.user-modal-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

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
  transition: background-color var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard);
}

.order-btn:hover:not(:disabled) {
  background: var(--action-primary);
  border-color: var(--color-primary);
  color: var(--action-on-primary);
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
}

.crown-icon-svg.micro {
  width: 11px;
  height: 11px;
  margin-right: 3px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.auth-modal-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.auth-desc {
  font-size: var(--fs-body);
  color: var(--text-secondary);
  line-height: var(--lh-normal);
}

.auth-desc code {
  color: var(--color-primary);
  font-weight: var(--fw-semibold);
}

.auth-error-msg {
  color: var(--color-danger);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.session-expired-notice {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  margin: 0 0 var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-warning) 10%, transparent);
  color: var(--text-primary);
  font-size: var(--fs-meta);
  line-height: 1.5;
}

.session-expired-notice svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--color-warning);
}

@media (max-width: 640px) {
  /* 表單是 Grid 排版（不是 flex），要改欄數才會生效；手機改成一欄一列 */
  .add-user-modal-form {
    grid-template-columns: minmax(0, 1fr);
    align-items: stretch;
  }
  .add-user-modal-form .field-input,
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
}

/* 觸控裝置：這幾個按鈕嵌在標題或輸入框裡，外觀維持原尺寸，
   用看不見的延伸點擊區把可點範圍撐到至少 44px */
@media (pointer: coarse) {
  .logout-btn {
    position: relative;
  }
  .logout-btn::after,
  .lock-toggle-btn::after,
  .password-toggle-btn::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--control-height-lg);
    height: var(--control-height-lg);
    transform: translate(-50%, -50%);
  }
}
</style>
