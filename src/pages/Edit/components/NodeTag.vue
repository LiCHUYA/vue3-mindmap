<template>
  <el-dialog 
    custom-class="nodeTagDialog" 
    v-model="dialogVisible" 
    :title="$t('nodeTag.title')"
    width="480px"
    destroy-on-close
  >
    <div class="tag-input">
      <el-input
        v-model="tag"
        @keyup.enter="add"
        :disabled="tagArr.length >= max"
        :placeholder="$t('nodeTag.addTip')"
      >
        <template #append>
          <el-button 
            @click="add"
            :disabled="!tag || tagArr.length >= max"
          >添加</el-button>
        </template>
      </el-input>
    </div>

    <div class="tag-list">
      <div
        class="tag-item"
        v-for="(item, index) in tagArr"
        :key="index"
        :style="{
          backgroundColor: generateColorByContent(item)
        }"
      >
        <span class="text">{{ item }}</span>
        <span class="delete" @click="del(index)">
          <el-icon><Close /></el-icon>
        </span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">{{ $t('dialog.cancel') }}</el-button>
        <el-button type="primary" @click="confirm">{{ $t('dialog.confirm') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * @Author: 黄原寅
 * @Desc: 节点标签内容设置
 */
import { onBeforeMount, onMounted, ref } from 'vue'
import { generateColorByContent } from 'simple-mind-map/src/utils/index'
import bus from '@/utils/bus.js'

const dialogVisible = ref(false)
const tagArr = ref([])
const tag = ref('')
const activeNodes = ref([])
const max = ref(5)

onMounted(() => {
  bus.on('node_active', handleNodeActive)
  bus.on('showNodeTag', handleShowNodeTag)
})

onBeforeMount(() => {
  bus.off('node_active', handleNodeActive)
  bus.off('showNodeTag', handleShowNodeTag)
})

const handleNodeActive = args => {
  activeNodes.value = [...args[1]]
  if (activeNodes.value.length > 0) {
    let firstNode = activeNodes.value[0]
    tagArr.value = firstNode.getData('tag') || []
  } else {
    tagArr.value = []
    tag.value = ''
  }
}

const handleShowNodeTag = () => {
  bus.emit('startTextEdit')
  dialogVisible.value = true
}

/**
 * @Author: 黄原寅
 * @Desc: 添加
 */
const add = () => {
  tagArr.value.push(tag.value)
  tag.value = ''
}

/**
 * @Author: 黄原寅
 * @Desc: 删除
 */
const del = index => {
  tagArr.value.splice(index, 1)
}

/**
 * @Author: 黄原寅
 * @Desc: 取消
 */
const cancel = () => {
  dialogVisible.value = false
  bus.emit('endTextEdit')
}

/**
 * @Author: 黄原寅
 * @Desc:  确定
 */
const confirm = () => {
  activeNodes.value.forEach(node => {
    node.setTag(tagArr.value)
  })
  cancel()
}
</script>

<script>
export default {
  name: 'NodeTag'
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.nodeTagDialog {
  .tag-input {
    margin-bottom: @spacing-base;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: @spacing-small;
    min-height: 100px;
    max-height: 200px;
    overflow-y: auto;
    padding: @spacing-small;
    border-radius: @border-radius-base;
    background: @bg-gray;

    .tag-item {
      display: inline-flex;
      align-items: center;
      padding: @spacing-mini @spacing-small;
      border-radius: @border-radius-small;
      color: #fff;
      font-size: @font-size-small;
      transition: all @transition-duration;
      cursor: default;

      .text {
        margin-right: @spacing-mini;
      }

      .delete {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0.7;
        transition: all @transition-duration;

        &:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.2);
        }
      }

      &:hover {
        transform: translateY(-1px);
      }
    }
  }
}
</style>
