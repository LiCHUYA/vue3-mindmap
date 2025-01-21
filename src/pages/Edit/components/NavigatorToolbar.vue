<template>
  <div class="navigatorContainer" :class="{ isDark }">
    <!-- 基础操作组 -->
    <div class="toolbar-group">
      <div class="item">
        <el-select v-model="lang" size="small" style="width: 100px" @change="onLangChange">
          <el-option v-for="item in langList" :key="item.value" :label="item.name" :value="item.value" />
        </el-select>
      </div>
      <div class="item">
        <div class="btn iconfont iconsousuo" @click="showSearch"></div>
      </div>
    </div>

    <!-- 视图操作组 -->
    <div class="toolbar-group">
      <div class="item">
        <MouseAction :isDark="isDark" :mindMap="mindMap"></MouseAction>
      </div>
      <div class="item">
        <el-tooltip effect="dark"
          :content="openMiniMap ? $t('navigatorToolbar.closeMiniMap') : $t('navigatorToolbar.openMiniMap')"
          placement="top">
          <div class="btn iconfont icondaohang1" @click="toggleMiniMap"></div>
        </el-tooltip>
      </div>
      <div class="item">
        <Fullscreen :isDark="isDark" :mindMap="mindMap"></Fullscreen>
      </div>
      <div class="item">
        <Scale :isDark="isDark" :mindMap="mindMap"></Scale>
      </div>
    </div>

    <!-- 模式切换组 -->
    <div class="toolbar-group">
      <div class="item">
        <el-tooltip effect="dark" :content="isReadonly ? $t('navigatorToolbar.edit') : $t('navigatorToolbar.readonly')"
          placement="top">
          <div class="btn iconfont" :class="[isReadonly ? 'iconyanjing' : 'iconbianji1']" @click="readonlyChange"></div>
        </el-tooltip>
      </div>
      <div class="item">
        <div class="btn iconfont" :class="[isDark ? 'iconmoon_line' : 'iconlieri']" @click="toggleDark"></div>
      </div>
      <div class="item">
        <el-tooltip effect="dark" :content="$t('回到根节点')" placement="top">
          <div class="btn iconfont icondingwei" @click="backToRoot"></div>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @Author: 黄原寅
 * @Desc: 导航器工具栏
 */
import { ref, onMounted, defineProps, computed } from 'vue'
import { useStore } from 'vuex'
import Scale from './Scale'
import Fullscreen from './Fullscreen'
import MouseAction from './MouseAction.vue'
import bus from '@/utils/bus.js'
import { langList } from '@/config'
import i18n from '@/i18n.js'
import { storeLang, getLang } from '@/api'

const props = defineProps({
  mindMap: {
    type: Object
  }
})

const store = useStore()
const openMiniMap = ref(false)
const lang = ref(getLang())
const isDark = computed(() => store.state.isDark)
const isReadonly = computed(() => store.state.isReadonly)

const readonlyChange = () => {
  store.commit('setIsReadonly', !isReadonly.value)
  props.mindMap.setMode(isReadonly.value ? 'readonly' : 'edit')
}

const toggleMiniMap = () => {
  openMiniMap.value = !openMiniMap.value
  bus.emit('toggle_mini_map', openMiniMap.value)
}

const onLangChange = lang => {
  i18n.locale = lang
  console.log('i18n', i18n)
  storeLang(lang)
  bus.emit('lang_change')
}

const showSearch = () => {
  bus.emit('show_search')
}

const toggleDark = () => {
  store.commit('setIsDark', !isDark.value)
}

const backToRoot = () => {
  if (props.mindMap) {
    const excuteCommandList = props.mindMap.keyCommand.shortcutMap
    excuteCommandList && excuteCommandList['Control+Enter'][0]()
  }
}
</script>

<script>
export default {
  name: 'NavigatorToolbar'
}
</script>

<style lang="less" scoped>
.navigatorContainer {
  padding: 4px;
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 24px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: 44px;
  font-size: 13px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  z-index: 100;
  border: 1px solid rgba(0, 0, 0, 0.06);

  &:hover {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    padding: 0 8px;
    position: relative;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 20%;
      height: 60%;
      width: 1px;
      background: linear-gradient(180deg,
          transparent 0%,
          rgba(0, 0, 0, 0.08) 20%,
          rgba(0, 0, 0, 0.08) 80%,
          transparent 100%);
    }

    .item {
      margin: 0 4px;

      .btn {
        cursor: pointer;
        font-size: 16px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.15s ease;
        color: rgba(0, 0, 0, 0.65);
        position: relative;

        &:hover {
          background: rgba(0, 0, 0, 0.04);
          color: rgba(0, 0, 0, 0.85);
        }

        &:active {
          background: rgba(0, 0, 0, 0.08);
          transform: scale(0.95);
        }
      }

      .el-select {
        .el-input__wrapper {
          border-radius: 6px;
          background: transparent;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08) inset;
          height: 28px;

          &:hover {
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15) inset;
          }
        }
      }
    }
  }

  &.isDark {
    background: rgba(38, 42, 46, 0.92);
    border-color: rgba(255, 255, 255, 0.08);

    .toolbar-group {
      &:not(:last-child)::after {
        background: linear-gradient(180deg,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 20%,
            rgba(255, 255, 255, 0.08) 80%,
            transparent 100%);
      }
    }

    .item {
      .btn {
        color: rgba(255, 255, 255, 0.85);

        &:hover {
          color: rgba(255, 255, 255, 1);
          background: rgba(255, 255, 255, 0.1);
        }

        &:active {
          background: rgba(255, 255, 255, 0.15);
        }
      }

      .el-select {
        .el-input__wrapper {
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;

          &:hover {
            box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
          }
        }
      }
    }
  }

  @media screen and (max-width: 590px) {
    left: 12px;
    right: 12px;
    transform: none;

    .toolbar-group {
      overflow-x: auto;
      padding: 0 4px;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}
</style>
