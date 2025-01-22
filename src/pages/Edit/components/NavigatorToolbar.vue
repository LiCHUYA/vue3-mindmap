<template>
  <div class="navigatorContainer" :class="{ isDark }">
    <!-- 基础操作组 -->
    <div class="toolbar-group">
      <div class="group-label">{{ $t('basic') }}</div>
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
      <div class="group-label">{{ $t('view') }}</div>
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
      <div class="group-label">{{ $t('mode') }}</div>
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
          <el-tooltip effect="dark" content="回到根节点" placement="top">
            <div class="btn iconfont icondingwei" @click="backToRoot"></div>
          </el-tooltip>
        </div>

        <div class="item">
          <el-tooltip effect="dark" content="初始化" placement="top">
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
import { ElMessageBox } from 'element-plus'
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

const handleInit = async () => {
  try {
    await ElMessageBox.confirm(
      '您确定需要初始化思维导图吗？<br/><br/>' +
      '<div class="warning-content">' +
      '<p>⚠️ 初始化后，当前数据和格式等等都将被清空初始化且无法恢复(重做/撤销)，建议提前备份您的数据。</p>' +
      '<p class="tip">💡 小提示：如果只是想清空当前画布，可以使用 <kbd>Ctrl+A</kbd> 快捷键全部选中，再点击头部删除节点即可。</p>' +
      '</div>',
      '初始化确认',
      {
        confirmButtonText: '确认初始化',
        cancelButtonText: '取消',
        draggable: true,
        closeOnClickModal: false,
        customClass: 'init-confirm-dialog',
        confirmButtonClass: 'init-confirm-btn',
        cancelButtonClass: 'init-cancel-btn',
        dangerouslyUseHTMLString: true, // 允许使用HTML标签
        showClose: true
      }
    )
    // 用户确认后，执行初始化
    const newData = {
      root: {
        data: {
          text: '新的根节点'
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

    bus.emit('setData', newData)
  } catch (err) {
    // 用户取消操作，不做任何处理
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

<style lang="less">
.init-confirm-dialog {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  max-width: 480px;

  .el-message-box__header {
    padding: 20px 24px;
    background: #f8f9fa;
    border-bottom: 1px solid #ebeef5;

    .el-message-box__title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;

      .el-message-box__status {
        font-size: 22px;
        padding-right: 10px;
      }
    }

    .el-message-box__headerbtn {
      top: 20px;
      right: 24px;

      &:hover .el-message-box__close {
        color: #f56c6c;
      }
    }
  }

  .el-message-box__content {
    padding: 24px;

    .el-message-box__message {
      padding-left: 0;

      .warning-content {
        p {
          margin: 8px 0;
          line-height: 1.6;
          color: #606266;

          &.tip {
            margin-top: 16px;
            color: #909399;
            font-size: 13px;
          }
        }

        kbd {
          background: #f5f7fa;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          padding: 2px 6px;
          font-family: Monaco, monospace;
          font-size: 12px;
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  .el-message-box__btns {
    padding: 12px 24px 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .init-confirm-btn {
      background-color: #f56c6c;
      border-color: #f56c6c;
      padding: 10px 20px;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        background-color: #f78989;
        border-color: #f78989;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
      }

      &:active {
        background-color: #dd6161;
        border-color: #dd6161;
        transform: translateY(0);
      }
    }

    .init-cancel-btn {
      padding: 10px 20px;
      font-weight: 500;
      border-color: #dcdfe6;

      &:hover {
        border-color: #c6c8cc;
        background-color: #f9f9fa;
      }
    }
  }
}

/* 暗色主题样式 */
.dark {
  .init-confirm-dialog {
    background-color: #1c1e23;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);

    .el-message-box__header {
      background: #262930;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .el-message-box__title {
        color: rgba(255, 255, 255, 0.9);
      }

      .el-message-box__headerbtn .el-message-box__close {
        color: rgba(255, 255, 255, 0.7);

        &:hover {
          color: #f56c6c;
        }
      }
    }

    .el-message-box__content {
      .warning-content {
        p {
          color: rgba(255, 255, 255, 0.8);

          &.tip {
            color: rgba(255, 255, 255, 0.5);
          }
        }

        kbd {
          background: #2c2e34;
          border-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }

    .el-message-box__btns {
      .init-cancel-btn {
        background: transparent;
        border-color: rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.8);

        &:hover {
          border-color: rgba(255, 255, 255, 0.3);
          background-color: rgba(255, 255, 255, 0.05);
        }
      }
    }
  }
}
</style>
