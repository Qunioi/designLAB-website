<template>
  <header class="page-header-component">
    <div class="header-main-row">
      <div class="title-wrap">
        <h1 class="page-title">{{ title }}</h1>
        <slot name="extra" />
      </div>

      <div class="header-actions">
        <slot name="actions" />

        <NotificationBell v-if="showNotification && !isGuest" class="page-header-bell" />

        <BaseButton variant="primary" class="add-btn" v-if="addBtnLabel && !isGuest" type="button" @click="$emit('add-click')">
          {{ addBtnLabel }}
        </BaseButton>
      </div>
    </div>

    <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
  </header>
</template>

<script setup>
import BaseButton from './base/BaseButton.vue';
import { computed } from 'vue';
import { identityVersion } from '../utils/identity';
import NotificationBell from './NotificationBell.vue';
import { getCurrentUser } from '../utils/userStore';

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  addBtnLabel: {
    type: String,
    default: ''
  },
  showNotification: {
    type: Boolean,
    default: true
  }
});

defineEmits(['add-click']);

const isGuest = computed(() => {
  identityVersion.value; // 登出／權杖過期／身分模擬切換時重新判斷
  const u = getCurrentUser();
  const uname = (u.username || '').toLowerCase();
  return !uname || uname === '@guest' || uname === '@account' || u.nickname === '訪客';
});
</script>

<style scoped>
.page-header-component {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding-top: var(--space-1);
}

.header-main-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

/* font-family／font-size／font-weight／color 跟 base.css 的 h1、
   h1~h6 共用規則數值一樣，這裡只需要覆寫 letter-spacing */
.page-title {
  letter-spacing: -0.025em;
}

.page-subtitle {
  font-size: var(--fs-body);
  color: var(--text-secondary);
  line-height: var(--lh-normal);
  max-width: 680px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

/* Navigation owns the notification entry on every mobile layout. Keep the
   page-level action above phone width (the phone top bar has its own bell). */
@media (max-width: 640px) {
  .page-header-bell {
    display: none;
  }
}

</style>
