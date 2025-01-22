<template>
  <el-dialog custom-class="nodeImageDialog" v-model="dialogVisible" title="设置节点图片" width="480px">
    <div class="image-setting-container">
      <div class="section">
        <div class="section-title">
          <el-icon>
            <Upload />
          </el-icon>
          <span>上传图片</span>
        </div>
        <ImgUpload ref="ImgUploadRef" @changeImg="onchange" :value="img" class="upload-area" />
      </div>

      <div class="section">
        <div class="section-title">
          <el-icon>
            <Link />
          </el-icon>
          <span>图片地址</span>
        </div>
        <el-input v-model="imgUrl" placeholder="请输入图片URL地址" @keydown.native.stop>
          <template #prefix>
            <el-icon>
              <Picture />
            </el-icon>
          </template>
        </el-input>
      </div>

      <div class="section">
        <div class="section-title">
          <el-icon>
            <EditPen />
          </el-icon>
          <span>图片标题</span>
        </div>
        <el-input v-model="imgTitle" placeholder="请输入图片标题（可选）" @keydown.native.stop>
          <template #prefix>
            <el-icon>
              <Document />
            </el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="confirm">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * @Author: 黄原寅
 * @Desc: 节点图片内容设置
 */
import { onBeforeMount, onMounted, ref } from 'vue'
import ImgUpload from '@/components/ImgUpload'
import { getImageSize } from 'simple-mind-map/src/utils/index'
import bus from '@/utils/bus.js'
import {
  Upload,
  Link,
  EditPen,
  Picture,
  Document
} from '@element-plus/icons-vue'
const dialogVisible = ref(false)
const img = ref('')
const imgUrl = ref('')
const imgTitle = ref('')
const activeNodes = ref(null)
const ImgUploadRef = ref(null)

onMounted(() => {
  bus.on('node_active', handleNodeActive)
  bus.on('showNodeImage', handleShowNodeImage)
})

onBeforeMount(() => {
  bus.off('node_active', handleNodeActive)
  bus.off('showNodeImage', handleShowNodeImage)
})

const handleNodeActive = args => {
  activeNodes.value = args[1]
}

const handleShowNodeImage = () => {
  reset()
  if (activeNodes.value.length > 0) {
    let firstNode = activeNodes.value[0]
    let imgSrc = firstNode.getData('image') || ''
    if (imgSrc) {
      if (/^https?:\/\//.test(imgSrc)) {
        imgUrl.value = imgSrc
      } else {
        img.value = imgSrc
      }
    }
    imgTitle.value = firstNode.getData('imageTitle') || ''
  }
  dialogVisible.value = true
}

const onchange = src => {
  img.value = src
}

/**
 * @Author: 黄原寅
 * @Desc: 取消
 */
const cancel = () => {
  dialogVisible.value = false
  img.value = ''
  reset()
}

const reset = () => {
  img.value = ''
  imgTitle.value = ''
  imgUrl.value = ''
}

/**
 * @Author: 黄原寅
 * @Desc:  确定
 */
const confirm = async () => {
  console.log(`output->img.value`, imgUrl.value)
  try {
    // 删除图片
    if (!img.value && !imgUrl.value) {
      cancel()
      activeNodes.value.forEach(node => {
        node.setImage(null)
      })
      return
    }
    let res = null
    let imgSrc = ''
    if (img.value) {
      imgSrc = img.value
      res = await ImgUploadRef.value.getSize()
    } else if (imgUrl.value) {
      imgSrc = imgUrl.value
      res = await getImageSize(imgSrc)
    }
    activeNodes.value.forEach(node => {
      node.setImage({
        url: imgSrc || 'none',
        title: imgTitle.value,
        width: res.width,
        height: res.height
      })
    })
    cancel()
  } catch (error) {
    console.log(`output->error`, error)
  }
}
</script>

<script>
export default {
  name: 'NodeImage'
}
</script>

<style lang="less" scoped>
.nodeImageDialog {
  .image-setting-container {
    padding: 20px 24px;

    .section {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        color: var(--el-text-color-primary);
        font-weight: 500;
        font-size: 14px;

        .el-icon {
          margin-right: 6px;
          font-size: 15px;
          color: var(--el-text-color-secondary);
        }
      }

      .upload-area {
        border: 1px dashed var(--el-border-color);
        border-radius: 4px;
        padding: 16px;
        transition: all 0.2s;

        &:hover {
          border-color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }
      }

      .el-input {
        .el-input__wrapper {
          padding: 0 12px;
          height: 36px;
          background: var(--el-bg-color-page);
          box-shadow: 0 0 0 1px var(--el-border-color) inset;
          transition: all 0.2s;

          &:hover {
            box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
          }

          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-color-primary) inset;
            background: var(--el-bg-color);
          }
        }

        :deep(.el-input__prefix) {
          margin-right: 8px;
          height: 100%;
          display: flex;
          align-items: center;

          .el-icon {
            font-size: 16px;
            color: var(--el-text-color-secondary);
            line-height: 1;
          }
        }

        .el-input__inner {
          height: 36px;
          line-height: 36px;
          font-size: 14px;
          color: var(--el-text-color-primary);

          &::placeholder {
            color: var(--el-text-color-placeholder);
            font-size: 14px;
          }
        }
      }
    }
  }
}

:deep(.el-dialog) {
  border-radius: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 16px 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);

  .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.4;
  }
}

:deep(.el-dialog__body) {
  padding: 0 !important;
  background: var(--el-bg-color);
}

:deep(.el-dialog__footer) {
  margin: 0;
  padding: 16px 24px;
  border-top: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);

  .el-button {
    height: 36px;
    padding: 0 16px;
    font-size: 15px;
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
</style>