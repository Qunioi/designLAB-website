<template>
  <!-- 內容卡（列表頁、首頁）：16:9 封面＋類型徽章列＋單行標題＋標籤／描述。
       hit：哪一塊可以點（media 只有封面、card 整張卡、none 不能點），點了 emit('open')。
       slot：
         media     疊在封面上的東西（外連按鈕、我發佈的標記、hover 提示）
         meta      標題上方左側（類型徽章）
         meta-end  標題上方右側（日期、編輯／刪除）
         default   標題下方（標籤、描述） -->
  <article class="card-panel">
    <button v-if="hit === 'card'" type="button" class="card-hit" :aria-label="hitLabel || `查看《${title}》`" @click="$emit('open')"></button>
    <div class="card-media-wrapper">
      <img v-if="cover" :src="cover" class="card-media" :alt="coverAlt || title" loading="lazy" />
      <div v-else class="card-media-placeholder" aria-hidden="true">
        <span>{{ placeholder || title }}</span>
      </div>
      <button v-if="hit === 'media'" type="button" class="card-hit" :aria-label="hitLabel || `查看《${title}》`" @click="$emit('open')"></button>
      <slot name="media" />
    </div>
    <div class="card-info">
      <div v-if="$slots.meta || $slots['meta-end']" class="card-meta-row">
        <div class="card-meta-left"><slot name="meta" /></div>
        <slot name="meta-end" />
      </div>
      <component :is="titleTag" class="card-title">{{ title }}</component>
      <slot />
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  cover: { type: String, default: '' },
  coverAlt: { type: String, default: '' },
  // 沒有封面時佔位區顯示的字（預設是標題）
  placeholder: { type: String, default: '' },
  hit: {
    type: String,
    default: 'media',
    validator: v => ['media', 'card', 'none'].includes(v)
  },
  hitLabel: { type: String, default: '' },
  titleTag: { type: String, default: 'h3' }
});

defineEmits(['open']);
</script>
