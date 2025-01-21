<template>
  <div class="sidebarContainer" :class="{ show, isDark }" :style="{ zIndex: show ? 1001 : 100 }">
    <div class="header">
      <span class="title">{{ title }}</span>
      <span class="closeBtn iconfont iconguanbi" @click="close"></span>
    </div>
    <div class="content" ref="content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineExpose } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})

const store = useStore()
const show = ref(false)
const content = ref(null)

const close = () => {
  show.value = false
  store.commit('setActiveSidebar', '')
}

const getEl = () => {
  return content.value
}

defineExpose({
  show,
  getEl
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.sidebarContainer {
  position: fixed;
  right: -305px;
  top: 0;
  bottom: 0;
  width: 305px;
  background: @bg-white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  font-family: @font-family;

  &.show {
    right: 0;

    .header {
      .closeBtn {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }

  &.isDark {
    background: @bg-dark;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);

    .header {
      background: darken(@bg-dark, 3%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);

      .title {
        color: rgba(255, 255, 255, 0.85);
      }

      .closeBtn {
        color: rgba(255, 255, 255, 0.65);

        &:hover {
          color: rgba(255, 255, 255, 0.85);
          background: rgba(255, 255, 255, 0.08);
        }
      }
    }
  }

  .header {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 @spacing-base;
    background: @bg-white;
    border-bottom: 1px solid @border-light;
    flex-shrink: 0;

    .title {
      font-size: @font-size-large;
      font-weight: 500;
      color: @text-primary;
    }

    .closeBtn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: @border-radius-small;
      transition: all @transition-duration;
      opacity: 0;
      transform: translateX(10px);
      color: @text-regular;

      &:hover {
        color: @text-primary;
        background: @bg-hover;
      }
    }
  }

  .content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.12);
      border-radius: 3px;

      &:hover {
        background: rgba(0, 0, 0, 0.2);
      }
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }
}
</style>
