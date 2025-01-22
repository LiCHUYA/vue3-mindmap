<template>
  <el-dialog v-model="dialogVisible" :title="$t('nodeHyperlink.title')" width="460px" align-center destroy-on-close
    class="hyperlink-dialog">
    <div class="item" style="margin-bottom: 16px;">
      <span class="name">{{ $t('nodeHyperlink.link') }}</span>
      <el-input v-model="link" placeholder="http://xxxx.com/" @keyup.native.stop @keydown.native.stop
        @blur="handleUrl()">
        <template #prepend>
          <el-select v-model="protocol" style="width: 90px">
            <el-option label="https" value="https"></el-option>
            <el-option label="http" value="http"></el-option>
            <el-option label="无" value="none"></el-option>
          </el-select>
        </template>
      </el-input>
    </div>
    <div class="item">
      <span class="name">{{ $t('nodeHyperlink.name') }}</span>
      <el-input v-model="linkTitle" @keyup.native.stop @keydown.native.stop></el-input>
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
import { ref, onMounted, onBeforeMount } from 'vue'
import bus from '@/utils/bus.js'
/**
 * @Author: 黄原寅
 * @Desc: 节点超链接内容设置
 */
const dialogVisible = ref(false)
const link = ref('')
const linkTitle = ref('')
const activeNodes = ref([])
const protocol = ref('https')

onMounted(() => {
  bus.on('node_active', handleNodeActive)
  bus.on('showNodeLink', handleShowNodeLink)
  bus.on('show_hyperlink', () => {
    console.log('Show hyperlink event received')
    handleShowNodeLink()
  })
})

onBeforeMount(() => {
  bus.off('node_active', handleNodeActive)
  bus.off('showNodeLink', handleShowNodeLink)
  bus.off('show_hyperlink')
})

const handleNodeActive = args => {
  activeNodes.value = [...args[1]]
  if (activeNodes.value.length > 0) {
    let firstNode = activeNodes.value[0]
    link.value = firstNode.getData('hyperlink') || ''
    handleUrl(true)
    linkTitle.value = firstNode.getData('hyperlinkTitle') || ''
  } else {
    link.value = ''
    linkTitle.value = ''
  }
}

const removeProtocol = url => {
  return url.replace(/^https?:\/\//, '')
}

const handleUrl = setProtocolNoneIfNotExist => {
  const res = link.value.match(/^(https?):\/\//)
  if (res && res[1]) {
    protocol.value = res[1]
  } else if (!link.value) {
    protocol.value = 'https'
  } else if (setProtocolNoneIfNotExist) {
    protocol.value = 'none'
  }
  link.value = removeProtocol(link.value)
}

const handleShowNodeLink = () => {
  activeNodes.value[0].mindMap.keyCommand.pause()
  bus.emit('startTextEdit')
  dialogVisible.value = true
}

/**
 * @Author: 黄原寅
 * @Desc: 取消
 */
const cancel = () => {
  dialogVisible.value = false
  activeNodes.value[0].mindMap.keyCommand.recovery()
  bus.emit('endTextEdit')
}

/**
 * @Author: 黄原寅
 * @Desc:  确定
 */
const confirm = () => {
  activeNodes.value.forEach(node => {
    if (!link.value.startsWith('http://') && !link.value.startsWith('https://') && !link.value.startsWith('//')) {
      link.value = `//${link.value}`
    }
    node.setHyperlink(link.value, linkTitle.value)
    node.setHyperlink((protocol.value === 'none' ? '' : protocol.value + '://') + link.value, linkTitle.value)
    cancel()
  })
}
</script>

<script>
export default {
  name: 'NodeHyperlink'
}
</script>

<style lang="less">
// 注意：这里不使用 scoped，因为需要覆盖 element-plus 的默认样式
.hyperlink-dialog {
  .el-dialog {
    border-radius: 8px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1),
      0 2px 6px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    margin-top: 15vh !important;
  }

  .el-dialog__header {
    margin: 0;
    padding: 16px 24px;
    border-bottom: 1px solid var(--el-border-color-light);
    background: var(--el-bg-color);

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      line-height: 1.5;
    }

    .el-dialog__headerbtn {
      width: 32px;
      height: 32px;
      top: 14px;
      right: 20px;

      .el-dialog__close {
        font-size: 16px;
        transition: transform 0.2s ease;
        color: var(--el-text-color-secondary);

        &:hover {
          transform: rotate(90deg);
          color: var(--el-color-danger);
        }
      }
    }
  }

  .el-dialog__body {
    padding: 24px;
    background: var(--el-bg-color);

    .item {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .name {
        width: 56px;
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin-right: 16px;
        flex-shrink: 0;
        user-select: none;
      }

      .el-input {
        flex: 1;

        .el-input__wrapper {
          height: 36px !important;
          line-height: 36px !important;
          padding: 0 12px !important;
          background: var(--el-bg-color-page);
          box-shadow: 0 0 0 1px var(--el-border-color) inset;
          transition: all 0.2s ease;

          &:hover {
            box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
          }

          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
          }
        }

        .el-input__inner {
          height: 36px !important;
          line-height: 36px !important;
          color: var(--el-text-color-primary);
          font-size: 14px !important;

          &::placeholder {
            color: var(--el-text-color-placeholder);
            font-size: 14px;
          }
        }
      }

      .el-select {
        .el-input {
          width: 90px;

          .el-input__wrapper {
            padding: 0 8px !important;
          }
        }
      }
    }
  }

  .el-dialog__footer {
    margin: 0;
    padding: 16px 24px;
    border-top: 1px solid var(--el-border-color-light);
    background: var(--el-bg-color);

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .el-button {
        height: 36px !important;
        line-height: 36px !important;
        padding: 0 16px !important;
        font-size: 14px !important;
        border-radius: 4px;
        font-weight: 500;
        min-width: 80px;

        &--default {
          border-color: var(--el-border-color);
          color: var(--el-text-color-regular);
          background: var(--el-bg-color-page);

          &:hover {
            color: var(--el-text-color-primary);
            border-color: var(--el-border-color-hover);
            background: var(--el-bg-color);
          }

          &:active {
            transform: translateY(1px);
          }
        }

        &--primary {
          &:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.3);
          }

          &:active {
            transform: translateY(1px);
            box-shadow: none;
          }
        }
      }
    }
  }
}

// 暗色主题样式
.dark {
  .hyperlink-dialog {
    .el-dialog {
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-darker);
    }
  }
}

// 全局覆盖一些基础样式
:root {
  --el-input-height: 36px;
  --el-input-line-height: 36px;
  --el-button-size: 36px;
}
</style>
