<template>
  <Transition name="fade">
    <div v-if="media.url" class="fullscreen-image-backdrop" role="dialog" aria-modal="true" aria-label="全螢幕媒體檢視" @click="$emit('close')">
      <button type="button" class="fullscreen-close-btn" @click="$emit('close')" aria-label="關閉全螢幕媒體" title="關閉全螢幕 (ESC)">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div class="fullscreen-media-content" @click.stop>
        <video v-if="media.isVideo" :src="media.url" controls autoplay class="fullscreen-video-element"></video>
        <img v-else :src="media.url" class="fullscreen-img" alt="全螢幕媒體" />
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  media: {
    type: Object,
    default: () => ({ url: '', isVideo: false })
  }
});

defineEmits(['close']);
</script>

<style scoped>
.fullscreen-image-backdrop {
  position: fixed;
  inset: 0;
  background: var(--modal-backdrop);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-fullscreen);
  padding: 2rem;
}

.fullscreen-media-content {
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: calc(var(--z-fullscreen) + 5);
}

.fullscreen-video-element,
.fullscreen-img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: var(--shadow-media);
}

.fullscreen-close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: calc(var(--z-fullscreen) + 10);
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.fullscreen-close-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.1);
}

.fullscreen-close-btn:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
