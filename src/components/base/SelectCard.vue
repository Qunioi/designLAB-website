<template>
  <!-- 選擇卡（管理精選、主題、媒體庫）：圓角 10、內距 8/12、封面 4:3。
       selectable 時整張卡是一個按鈕：右上勾選圓點＋主色 2px 邊框表示已選。
         multiple：可以複選（管理精選）→ role="checkbox"；否則是單選（主題）→ aria-pressed。
       slot：media 封面（mediaFrame=false 時不套 4:3 外框，自己排）、default 文字區。 -->
  <article class="select-card" :class="{ 'is-selected': selectable && selected }">
    <button
      v-if="selectable"
      type="button"
      class="card-hit"
      :role="multiple ? 'checkbox' : undefined"
      :aria-checked="multiple ? String(selected) : undefined"
      :aria-pressed="multiple ? undefined : String(selected)"
      :aria-label="label"
      :disabled="disabled"
      @click="$emit('toggle')"
    ></button>
    <span v-if="selectable" class="select-card-check" aria-hidden="true">
      <Icon name="check" :size="12" :stroke-width="3" />
    </span>
    <div v-if="$slots.media" :class="mediaFrame ? ['select-card-media', mediaClass] : mediaClass">
      <slot name="media" />
    </div>
    <div class="select-card-body" :class="bodyClass">
      <slot />
    </div>
  </article>
</template>

<script setup>
import Icon from './Icon.vue';

defineProps({
  selectable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  // 整張卡按鈕的報讀名稱（例如「設為精選：標題」）
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  mediaFrame: { type: Boolean, default: true },
  mediaClass: { type: [String, Array, Object], default: '' },
  bodyClass: { type: [String, Array, Object], default: '' }
});

defineEmits(['toggle']);
</script>
