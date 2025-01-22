<template>
  <el-dialog custom-class="nodeImageDialog" v-model="dialogVisible" title="设置节点图片" width="580px">
    <div class="image-setting-container">
      <!-- 上传区域 -->
      <div class="section">
        <div class="section-title">
          <el-icon>
            <Upload />
          </el-icon>
          <span>上传图片</span>
        </div>
        <ImgUpload ref="ImgUploadRef" @change="handleImageChange" :value="img" class="upload-area" />
      </div>

      <!-- URL输入区域 -->
      <div class="section">
        <div class="section-title">
          <el-icon>
            <Link />
          </el-icon>
          <span>图片地址</span>
        </div>
        <el-input v-model="imgUrl" size="default" placeholder="请输入图片URL地址" @keydown.stop>
          <template #prefix>
            <el-icon>
              <Picture />
            </el-icon>
          </template>
        </el-input>
      </div>

      <!-- 图片标题区域 -->
      <div class="section">
        <div class="section-title">
          <el-icon>
            <EditPen />
          </el-icon>
          <span>图片标题</span>
        </div>
        <el-input v-model="imgTitle" size="default" placeholder="请输入图片标题（可选）" @keydown.stop>
          <template #prefix>
            <el-icon>
              <Document />
            </el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * @Author: 黄原寅
 * @Desc: 节点图片内容设置
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Upload, Link, Picture, EditPen, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ImgUpload from '@/components/ImgUpload'
import { getImageSize } from 'simple-mind-map/src/utils/index'
import bus from '@/utils/bus.js'

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

onBeforeUnmount(() => {
  bus.off('node_active', handleNodeActive)
  bus.off('showNodeImage', handleShowNodeImage)
})

const handleNodeActive = args => {
  activeNodes.value = args[1]
}

const handleShowNodeImage = () => {
  reset()
  if (activeNodes.value?.length > 0) {
    const firstNode = activeNodes.value[0]
    const imgSrc = firstNode.getData('image') || ''
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

const handleImageChange = src => {
  img.value = src
  imgUrl.value = '' // 清空URL输入，避免冲突
}

const cancel = () => {
  dialogVisible.value = false
  reset()
}

const reset = () => {
  img.value = ''
  imgTitle.value = ''
  imgUrl.value = ''
}

const handleConfirm = async () => {
  try {
    // 删除图片
    if (!img.value && !imgUrl.value) {
      cancel()
      activeNodes.value?.forEach(node => {
        node.setImage(null)
      })
      return
    }

    let imageSize = null
    let imgSrc = ''

    if (img.value) {
      imgSrc = img.value
      imageSize = await ImgUploadRef.value.getSize()
    } else if (imgUrl.value) {
      imgSrc = imgUrl.value
      imageSize = await getImageSize(imgSrc)
    }

    activeNodes.value?.forEach(node => {
      node.setImage({
        url: imgSrc,
        title: imgTitle.value,
        width: imageSize.width,
        height: imageSize.height
      })
    })
    cancel()
  } catch (error) {
    ElMessage.error('设置图片失败，请检查图片地址是否正确')
    console.error('设置图片失败:', error)
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
    padding: 0 12px;

    .section {
      margin-bottom: 24px;

      .section-title {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        color: var(--el-text-color-primary);
        font-weight: 500;

        .el-icon {
          margin-right: 8px;
          font-size: 16px;
        }

        span {
          font-size: 14px;
        }
      }

      .upload-area {
        margin-top: 8px;
      }

      .el-input {
        .el-input__wrapper {
          padding-left: 8px;
        }

        .el-input__prefix {
          margin-right: 8px;
        }
      }
    }
  }

  .dialog-footer {
    padding-top: 8px;
    text-align: right;
  }
}

:deep(.el-dialog__header) {
  margin-bottom: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-dialog__body) {
  padding-top: 16px;
}
</style>
