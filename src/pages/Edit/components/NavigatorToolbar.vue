<template>
  <div class="navigatorContainer" :class="{ isDark }">
    <!-- 基础操作组 -->
    <div class="toolbar-group">
      <div class="group-label">{{ $t('基础') }}</div>
      <div class="group-items">
        <div class="item">
          <el-select v-model="lang" size="small" class="lang-select" @change="onLangChange">
            <el-option v-for="item in langList" :key="item.value" :label="item.name" :value="item.value" />
          </el-select>
        </div>
        <div class="item">
          <div class="btn iconfont iconsousuo" @click="showSearch"></div>
        </div>
      </div>
    </div>

    <!-- 视图操作组 -->
    <div class="toolbar-group">
      <div class="group-label">{{ $t('视图') }}</div>
      <div class="group-items">
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
    </div>

    <!-- 模式切换组 -->
    <div class="toolbar-group">
      <div class="group-label">{{ $t('模式') }}</div>
      <div class="group-items">
        <div class="item">
          <el-tooltip effect="dark"
            :content="isReadonly ? $t('navigatorToolbar.edit') : $t('navigatorToolbar.readonly')" placement="top">
            <div class="btn iconfont" :class="[isReadonly ? 'iconyanjing' : 'iconbianji1']" @click="readonlyChange">
            </div>
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

        <div class="item">
          <el-tooltip effect="dark" :content="$t('初始化')" placement="top">
            <el-icon class="btn" @click="handleInit">
              <Refresh />
            </el-icon>
          </el-tooltip>
        </div>

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
import { Refresh } from '@element-plus/icons-vue'

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

const handleInit = () => {
  // 创建新的初始数据
  const newData = {
    root: {
      data: {
        text: "新的根节点"
      },
      children: []
    },
    theme: {
      template: 'thesis1',
      config: {
        backgroundColor: '#ffffff'
      }
    },
    layout: 'logicalStructure',
    config: {}
  }

  // 使用 Edit 组件的 setData 方法更新数据
  bus.emit('setData', newData)
}

</script>

<script>
export default {
  name: 'NavigatorToolbar'
}
</script>

<style lang="less" scoped>
.navigatorContainer {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08),
    0 4px 24px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: stretch;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  border: 1px solid rgba(0, 0, 0, 0.04);
  padding: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12),
      0 8px 32px rgba(0, 0, 0, 0.06);
    transform: translateX(-50%) translateY(-1px);
  }

  .toolbar-group {
    position: relative;
    padding: 0 12px;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 15%;
      height: 70%;
      width: 1px;
      background: linear-gradient(180deg,
          transparent 0%,
          rgba(0, 0, 0, 0.06) 20%,
          rgba(0, 0, 0, 0.06) 80%,
          transparent 100%);
    }

    .group-label {
      font-size: 11px;
      color: rgba(0, 0, 0, 0.45);
      margin-bottom: 4px;
      white-space: nowrap;
      user-select: none;
    }

    .group-items {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 32px;

      .item {
        display: flex;
        align-items: center;

        .btn {
          cursor: pointer;
          font-size: 16px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: rgba(0, 0, 0, 0.75);
          user-select: none;

          &:hover {
            background: rgba(0, 0, 0, 0.04);
            color: rgba(0, 0, 0, 0.95);
          }

          &:active {
            background: rgba(0, 0, 0, 0.08);
            transform: scale(0.95);
          }
        }

        .lang-select {
          width: 90px;

          .el-input__wrapper {
            padding: 0 8px;
            border-radius: 6px;
            background: transparent;
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08) inset;
            height: 28px;

            &:hover {
              box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15) inset;
            }

            &.is-focus {
              box-shadow: 0 0 0 1px var(--el-color-primary) inset;
            }
          }
        }
      }
    }
  }

  &.isDark {
    background: rgba(28, 30, 35, 0.95);
    border-color: rgba(255, 255, 255, 0.06);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
      0 4px 24px rgba(0, 0, 0, 0.1);

    &:hover {
      background: rgba(28, 30, 35, 0.98);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25),
        0 8px 32px rgba(0, 0, 0, 0.15);
    }

    .toolbar-group {
      &:not(:last-child)::after {
        background: linear-gradient(180deg,
            transparent 0%,
            rgba(255, 255, 255, 0.06) 20%,
            rgba(255, 255, 255, 0.06) 80%,
            transparent 100%);
      }

      .group-label {
        color: rgba(255, 255, 255, 0.45);
      }

      .group-items {
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

          .lang-select {
            .el-input__wrapper {
              box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;

              &:hover {
                box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
              }
            }
          }
        }
      }
    }
  }

  @media screen and (max-width: 590px) {
    left: 12px;
    right: 12px;
    transform: none;
    padding: 4px;

    &:hover {
      transform: none;
    }

    .toolbar-group {
      padding: 0 8px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;

      .group-label {
        display: none;
      }

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}
</style>
