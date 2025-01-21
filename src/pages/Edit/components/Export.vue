<template>
  <el-dialog custom-class="nodeExportDialog" v-model="dialogVisible" :title="$t('export.title')" width="700px"
    v-loading.fullscreen.lock="loading" :element-loading-text="loadingText" element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <div class="exportContainer" :class="{ isDark: isDark }">
      <div class="nameInputBox">
        <span class="name">{{ $t('export.filename') }}</span>
        <el-input style="width: 300px" v-model="fileName" size="small" @keydown.native.stop></el-input>
        <el-checkbox v-show="['smm', 'json'].includes(exportType)" v-model="widthConfig" style="margin-left: 12px">
          {{ $t('export.include') }}
        </el-checkbox>
      </div>
      <div class="paddingInputBox" v-show="['svg', 'png', 'pdf'].includes(exportType)">
        <span class="name">{{ $t('export.paddingX') }}</span>
        <el-input style="width: 100px" v-model="paddingX" size="small" @change="onPaddingChange"
          @keydown.native.stop></el-input>
        <span class="name" style="margin-left: 10px">{{ $t('export.paddingY') }}</span>
        <el-input style="width: 100px" v-model="paddingY" size="small" @change="onPaddingChange"
          @keydown.native.stop></el-input>
        <el-checkbox v-show="['png', 'pdf'].includes(exportType)" v-model="isTransparent" style="margin-left: 12px">{{
          $t('export.isTransparent')
        }}</el-checkbox>
      </div>
      <div class="downloadTypeList">
        <div class="downloadTypeItem" v-for="item in downTypeList2" :key="item.type"
          :class="{ active: exportType === item.type }" @click="exportType = item.type">
          <div class="icon iconfont" :class="[item.icon, item.type]"></div>
          <div class="info">
            <div class="name">{{ item.name }}</div>
            <div class="desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
      <div class="tip">{{ $t('export.tips') }}</div>
      <!-- <div class="tip warning" v-if="openNodeRichText && exportType === 'svg' && domToImage">{{ $t('export.svgTips') }}</div> -->
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">{{ $t('dialog.cancel') }}</el-button>
        <el-button type="primary" @click="confirm">{{ $t('dialog.confirm') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * @Author: 黄原寅
 * @Desc: 导出功能
 */
import { onMounted, ref, computed, onBeforeMount } from 'vue'
import bus from '@/utils/bus.js'
import { ElNotification } from 'element-plus'
import { mapState, useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { downTypeList } from '@/config'

const store = useStore()
const { t } = useI18n()
const dialogVisible = ref(false)
const exportType = ref('smm')
const fileName = ref('思维导图')
const widthConfig = ref(true)
const isTransparent = ref(false)
const loading = ref(false)
const loadingText = ref('')
const paddingX = ref(10)
const paddingY = ref(10)

const openNodeRichText = computed(() => store.state.localConfig.openNodeRichText)
const isDark = computed(() => store.state.isDark)
const downTypeList2 = computed(() => downTypeList[t.locale] || downTypeList.zh)

onMounted(() => {
  bus.on('showExport', handleShowExport)
})

onBeforeMount(() => {
  bus.off('showExport', handleShowExport)
})

const handleShowExport = () => {
  dialogVisible.value = true
}

const onPaddingChange = () => {
  bus.emit('paddingChange', {
    exportPaddingX: Number(paddingX.value),
    exportPaddingY: Number(paddingY.value)
  })
}

/**
 * @Author: 黄原寅
 * @Desc: 取消导出
 */
const cancel = () => {
  dialogVisible.value = false
}

/**
 * @Author: 黄原寅
 * @Desc:  确定导出
 */
const confirm = () => {
  bus.emit('export', [exportType.value, true, fileName.value, widthConfig.value]) // mitt只支持传入一个参数
  if (exportType.value === 'svg') {
    bus.emit(
      'export',
      exportType.value,
      true,
      fileName.value,
      `* {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }`
    )
  } else if (['smm', 'json'].includes(exportType.value)) {
    bus.emit('export', exportType.value, true, fileName.value, widthConfig.value)
  } else if (exportType.value === 'png') {
    bus.emit('export', exportType.value, true, fileName.value, isTransparent.value)
  } else if (exportType.value === 'pdf') {
    bus.emit('export', exportType.value, true, fileName.value, isTransparent.value)
  } else {
    bus.emit('export', exportType.value, true, fileName.value)
  }
  cancel()
  ElNotification({
    title: t('export.notifyTitle'),
    message: t('export.notifyMessage'),
    type: 'warning'
  })
}
</script>

<script>
export default {
  name: 'Export'
}
</script>

<style lang="less" scoped>
.exportContainer {
  padding: 24px 32px;

  &.isDark {
    .downloadTypeList {
      .downloadTypeItem {
        background-color: #1f1f1f;
        border-color: #434343;

        &:hover {
          background-color: #262626;
          border-color: var(--el-color-primary);
        }

        .info {
          .name {
            color: rgba(255, 255, 255, 0.85);
          }

          .desc {
            color: rgba(255, 255, 255, 0.45);
          }
        }
      }
    }
  }
}

.nodeExportDialog {
  .form-section {
    max-width: 680px;
    margin-bottom: 32px;
  }

  .nameInputBox,
  .paddingInputBox {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .name {
      min-width: 90px;
      margin-right: 12px;
      color: var(--el-text-color-regular);
      font-size: 14px;
      text-align: right;
      line-height: 28px;

      &::after {
        content: ':';
        margin: 0 6px 0 2px;
        position: relative;
        top: -0.5px;
      }
    }

    :deep(.el-input) {
      width: 200px;

      .el-input__wrapper {
        padding: 0 12px;
        height: 32px;
        line-height: 32px;
        border-radius: 4px;
        border: 1px solid var(--el-border-color);
        box-shadow: none !important;
        transition: all 0.2s;

        &:hover {
          border-color: var(--el-color-primary-light-3);
        }

        &.is-focus {
          border-color: var(--el-color-primary);
          box-shadow: 0 0 0 2px rgba(var(--el-color-primary-rgb), 0.1) !important;
        }
      }

      .el-input__inner {
        height: 30px;
        font-size: 13px;
      }
    }

    .el-checkbox {
      margin-left: 16px;

      :deep(.el-checkbox__label) {
        font-size: 13px;
        color: var(--el-text-color-regular);
      }

      :deep(.el-checkbox__inner) {
        border-radius: 3px;
      }
    }
  }

  .paddingInputBox {
    :deep(.el-input) {
      width: 90px;
    }

    .name:not(:first-child) {
      min-width: unset;
      margin-left: 12px;
    }
  }

  .tip {
    margin: 16px 0 24px;
    padding: 8px 16px 8px 38px;
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    border-radius: 2px;
    color: rgba(0, 0, 0, 0.85);
    font-size: 14px;
    line-height: 1.5715;
    position: relative;

    &::before {
      content: '!';
      position: absolute;
      left: 16px;
      top: 10px;
      color: #1890ff;
      font-weight: bold;
    }

    &.warning {
      background-color: #fff2f0;
      border-color: #ffccc7;
      color: #ff4d4f;

      &::before {
        color: #ff4d4f;
      }
    }
  }

  .downloadTypeList {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 16px;

    .downloadTypeItem {
      position: relative;
      height: 96px;
      padding: 20px;
      background: #fff;
      border: 1px solid #f0f0f0;
      border-radius: 6px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-2px);
        border-color: var(--el-color-primary-light-5);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }

      &.active {
        background: linear-gradient(135deg,
            var(--el-color-primary-light-9) 0%,
            rgba(255, 255, 255, 0.9) 100%);
        border-color: var(--el-color-primary);
        box-shadow: 0 4px 16px rgba(var(--el-color-primary-rgb), 0.15);
      }

      .icon {
        font-size: 32px;
        margin-right: 16px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &.png {
          color: #ffc53d;
        }

        &.pdf {
          color: #ff4d4f;
        }

        &.md {
          color: #434343;
        }

        &.json {
          color: #52c41a;
        }

        &.svg {
          color: #1890ff;
        }

        &.smm {
          color: var(--el-color-primary);
        }
      }

      .info {
        flex: 1;

        .name {
          color: var(--el-text-color-primary);
          font-size: 15px;
          font-weight: 600;
          line-height: 1.4;
          margin-bottom: 4px;
        }

        .desc {
          color: var(--el-text-color-secondary);
          font-size: 13px;
          line-height: 1.5;
        }
      }
    }
  }
}

// Dialog styles
.nodeExportDialog {
  :deep(.el-dialog) {
    padding: 0;
    border-radius: 2px;
    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 9px 28px 8px rgba(0, 0, 0, 0.05);
  }

  .el-dialog__header {
    padding: 16px 24px;
    margin: 0;
    border-bottom: 1px solid #f0f0f0;

    .el-dialog__title {
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
    }
  }

  .el-dialog__body {
    padding: 0 !important;
  }

  .el-dialog__footer {
    padding: 10px 16px;
    border-top: 1px solid #f0f0f0;

    :deep(.el-button) {
      height: 32px;
      padding: 4px 15px;
      border-radius: 2px;
      font-size: 14px;

      &--default {
        border-color: #d9d9d9;

        &:hover {
          color: var(--el-color-primary);
          border-color: var(--el-color-primary);
        }
      }

      &--primary {
        background: var(--el-color-primary);

        &:hover {
          background: var(--el-color-primary-light-3);
        }
      }
    }
  }
}
</style>

<style lang="less">
.nodeExportDialog {
  .el-dialog__body {
    background-color: var(--el-bg-color-page) !important;
    padding: 0 !important;
  }

  .el-dialog__header {
    margin-right: 0;
    padding: 20px 24px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style>
