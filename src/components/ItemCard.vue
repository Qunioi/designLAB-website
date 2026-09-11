<template>
  <!-- 列表頁與首頁共用的內容卡：封面浮層（hover 提示、我發佈的圓點、外連）＋類型徽章＋描述／製作工具／標籤。
       filterable 時徽章與 chip 可點擊切換篩選（列表頁），否則是純文字（首頁）。
       hit、title-tag、hit-label、class 等其餘屬性直接傳給 ContentCard。 -->
  <ContentCard :title="title" :cover="cover" @open="$emit('open')">
    <template #media>
      <div class="hover-overlay" aria-hidden="true">
        <Icon name="eye" :size="22" />
        <span>點擊看詳情</span>
      </div>
      <div v-if="mine" class="mine-avatar-dot" title="我發佈的">
        <Icon name="user-solid" :size="10" />
      </div>
      <!-- wrapper 承接主題光暈，內層 <a> 保持清晰 -->
      <div v-if="link" class="ext-link-wrapper">
        <a :href="link" target="_blank" rel="noopener noreferrer" class="media-ext-link" @click.stop :aria-label="`前往《${title}》`" title="前往">
          <Icon name="external-link" :size="13" />
        </a>
      </div>
    </template>
    <template #meta>
      <Chip
        v-if="badge"
        variant="type"
        :clickable="filterable && badgeClickable"
        :title="filterable && badgeClickable ? '點擊切換類型篩選' : undefined"
        @click="$emit('badge-click')"
      >{{ badge }}</Chip>
    </template>
    <template v-if="$slots['meta-end']" #meta-end>
      <slot name="meta-end" />
    </template>

    <p v-if="desc" class="card-desc">{{ desc }}</p>
    <div v-if="tools.length" class="card-tools">
      <Chip
        v-for="tool in tools"
        :key="tool"
        variant="tool"
        :clickable="filterable"
        :active="filterable && isToolActive(tool)"
        :title="filterable ? `點擊${isToolActive(tool) ? '取消' : '快速'}篩選製作工具：${tool}` : undefined"
        @click.stop="$emit('toggle-tool', tool)"
      >{{ tool }}</Chip>
    </div>
    <div v-if="tags.length" class="card-tags">
      <Chip
        v-for="tag in tags"
        :key="tag"
        variant="tag"
        :clickable="filterable"
        :active="filterable && isTagActive(tag)"
        :title="filterable ? `點擊${isTagActive(tag) ? '取消' : '快速'}篩選 #${tag}` : undefined"
        @click.stop="$emit('toggle-tag', tag)"
      >{{ tag }}</Chip>
    </div>
  </ContentCard>
</template>

<script setup>
import ContentCard from './base/ContentCard.vue';
import Chip from './base/Chip.vue';
import Icon from './base/Icon.vue';

defineProps({
  title: { type: String, required: true },
  cover: { type: String, default: '' },
  link: { type: String, default: '' },
  badge: { type: String, default: '' },
  desc: { type: String, default: '' },
  tools: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
  mine: { type: Boolean, default: false },
  filterable: { type: Boolean, default: false },
  // 徽章是固定文字（例如「AI 工具中心」）時不能拿來篩選
  badgeClickable: { type: Boolean, default: true },
  isTagActive: { type: Function, default: () => false },
  isToolActive: { type: Function, default: () => false }
});

defineEmits(['open', 'badge-click', 'toggle-tag', 'toggle-tool']);
</script>

<style scoped>
.mine-avatar-dot {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  z-index: 6;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--action-primary);
  color: var(--action-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--on-media-soft);
  box-shadow: var(--shadow-sm);
  transition: transform var(--dur-fast) var(--ease-standard);
}
.card-panel:hover .mine-avatar-dot {
  transform: scale(1.08);
}

.ext-link-wrapper {
  position: absolute;
  top: 0.65rem; right: 0.65rem;
  width: 32px; height: 32px;
  border-radius: var(--radius-sm);
  z-index: 5;
  transition: box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard);
}

.ext-link-wrapper:hover {
  box-shadow: var(--shadow-hover);
  transform: scale(1.05);
}

.media-ext-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; height: 100%;
  border-radius: inherit;
  background: var(--media-shade);
  color: var(--on-media);
  opacity: 0.88;
  box-shadow: var(--shadow-sm);
  transition: background-color var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard), opacity var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard);
}
.media-ext-link svg {
  stroke: currentColor;
  width: 14px;
  height: 14px;
}
.media-ext-link:hover,
.media-ext-link:focus-visible {
  opacity: 1;
  background: var(--action-primary);
  border-color: var(--on-media);
  color: var(--action-on-primary);
  transform: translateY(-1px);
}
.media-ext-link:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-primary) 55%, transparent);
  outline-offset: 3px;
}

.hover-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: var(--media-shade);
  opacity: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--on-media);
  font-size: var(--fs-body);
  gap: var(--space-2);
  transition: opacity var(--dur-base) var(--ease-standard);
}
.card-media-wrapper:hover .hover-overlay { opacity: 1; }

/* 觸控裝置沒有 hover：外連按鈕常駐 */
@media (pointer: coarse) {
  .media-ext-link { opacity: 1; }
}
</style>
