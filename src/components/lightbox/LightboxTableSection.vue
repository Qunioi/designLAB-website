<template>
  <LightboxSection :icon="icon" :title="title" :accent="accent">
    <div class="lbs-table">
      <div v-for="row in rows" :key="row.label" class="lbs-table-row">
        <span class="lbs-table-label">{{ row.label }}</span>
        <a v-if="row.href" :href="row.href" target="_blank" rel="noopener noreferrer" class="lbs-table-value lbs-table-link">{{ row.value }}</a>
        <span v-else class="lbs-table-value">{{ row.value }}</span>
      </div>
    </div>
  </LightboxSection>
</template>

<script setup>
// 有 href 的列渲染成連結
import LightboxSection from './LightboxSection.vue';

defineProps({
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  accent: { type: String, default: 'var(--color-primary)' },
  rows: { type: Array, default: () => [] } // [{ label, value, href? }]
});
</script>

<style scoped>
.lbs-table {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.lbs-table-row {
  display: grid;
  grid-template-columns: minmax(90px, 0.4fr) 1.15fr;
  gap: var(--space-2);
}

.lbs-table-row + .lbs-table-row {
  border-top: 1px solid var(--border-color);
}

.lbs-table-label,
.lbs-table-value {
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-meta);
  line-height: var(--lh-normal);
}

.lbs-table-label {
  font-weight: var(--fw-bold);
  border-right: 1px solid var(--border-color);
}

.lbs-table-value {
  color: var(--text-secondary);
}

.lbs-table-link {
  color: var(--color-primary);
  font-weight: var(--fw-semibold);
  text-decoration: none;
}

.lbs-table-link:hover {
  text-decoration: underline;
}
</style>
