<template>
  <LightboxSection :icon="icon" :title="title" :accent="accent">
    <div class="lbs-list">
      <div v-for="(text, index) in items" :key="`${index}-${text}`" class="lbs-list-item">
        <span v-if="marker !== 'none'" class="lbs-list-marker" :class="`is-${marker}`" :style="marker === 'number' ? undefined : { background: accent }">
          <Icon name="check" :size="11" :stroke-width="3" v-if="marker === 'check'" />
          <Icon name="close" :size="10" :stroke-width="3" v-else-if="marker === 'cross'" />
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span class="lbs-list-text">{{ text }}</span>
      </div>
    </div>
  </LightboxSection>
</template>

<script setup>
import Icon from '../base/Icon.vue';
import LightboxSection from './LightboxSection.vue';

defineProps({
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  accent: { type: String, default: 'var(--color-primary)' },
  items: { type: Array, default: () => [] },
  // 'number'：1、2、3... 依序編號（適合有先後順序的步驟，例如工作流程）
  // 'check'：全部都是打勾圖示（適合條列式重點，例如「值得參考」「優點」，項目之間沒有順序關係）
  // 'cross'：全部都是叉叉圖示（適合負面條列，例如「缺點」）
  // 'none'：不顯示前面的符號，純文字條列
  marker: { type: String, default: 'number' }
});
</script>

<style scoped>
.lbs-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.lbs-list-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* 編號圓點一律用主色（不跟著區塊的 accent 走）；打勾／打叉帶有「好／壞」語意，
   仍用傳進來的 accent（例如競品優點綠、缺點紅）。 */
.lbs-list-marker {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--action-primary);
  color: var(--action-on-primary);
  font-size: var(--fs-badge);
  font-weight: var(--fw-bold);
}

.lbs-list-marker.is-cross {
  color: var(--action-on-danger);
}

.lbs-list-text {
  color: var(--text-secondary);
  font-size: var(--fs-body);
  line-height: var(--lh-normal);
}
</style>
