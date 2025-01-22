<template>
  <div class="toolbar-container" :class="{ isDark }">
    <div class="toolbar" ref="toolbarRef">
      <!-- 文件操作组 -->
      <div class="toolbar-group">
        <div class="toolbar-btn primary" @click="createNewLocalFile">
          <span class="icon iconfont iconxinjian"></span>
          <span class="text">{{ $t('toolbar.newFile') }}</span>
        </div>
        <div class="toolbar-btn" @click="openLocalFile">
          <span class="icon iconfont icondakai"></span>
          <span class="text">{{ $t('toolbar.openFile') }}</span>
        </div>
        <div class="toolbar-btn" @click="saveLocalFile">
          <span class="icon iconfont iconlingcunwei"></span>
          <span class="text">{{ $t('toolbar.saveAs') }}</span>
        </div>
      </div>

      <!-- 节点操作组 -->
      <div class="toolbar-group">
        <ToolbarNodeBtnList :list="horizontalList" @click="handleNodeBtnClick" />
        <el-popover v-if="showMoreBtn" v-model="popoverShow" placement="bottom-end" trigger="hover" :width="200">
          <template #reference>
            <div class="toolbar-btn">
              <span class="icon iconfont icongongshi"></span>
              <span class="text">{{ $t('toolbar.more') }}</span>
            </div>
          </template>
          <ToolbarNodeBtnList dir="v" :list="verticalList" @click="popoverShow = false" />
        </el-popover>
      </div>

      <!-- 导入导出组 -->
      <div class="toolbar-group">
        <div class="toolbar-btn" @click="emit('showImport')">
          <span class="icon iconfont icondaoru"></span>
          <span class="text">{{ $t('toolbar.import') }}</span>
        </div>
        <div class="toolbar-btn" @click="emit('showExport')">
          <span class="icon iconfont iconexport"></span>
          <span class="text">{{ $t('toolbar.export') }}</span>
        </div>
      </div>
    </div>

    <!-- 子组件 -->
    <NodeImage />
    <NodeHyperlink />
    <NodeIcon />
    <NodeNote />
    <NodeTag />
    <Export />
    <Import />
  </div>
</template>

<script>
import NodeImage from './NodeImage'
import NodeHyperlink from './NodeHyperlink'
import NodeIcon from './NodeIcon'
import NodeNote from './NodeNote'
import NodeTag from './NodeTag'
import Export from './Export'
import Import from './Import'
import { mapState } from 'vuex'
import { ElNotification } from 'element-plus'
import exampleData from 'simple-mind-map/example/exampleData'
import { getData } from '../../../api'
import bus from '@/utils/bus.js'
import ToolbarNodeBtnList from './ToolbarNodeBtnList.vue'
import { throttle } from 'simple-mind-map/src/utils/index'

/**
 * @Author: 黄原寅
 * @Desc: 工具栏
 */
let fileHandle = null
export default {
  name: 'Toolbar',
  components: {
    NodeImage,
    NodeHyperlink,
    NodeIcon,
    NodeNote,
    NodeTag,
    Export,
    Import,
    ToolbarNodeBtnList
  },
  data() {
    return {
      list: [
        'back',
        'forward',
        'painter',
        'siblingNode',
        'childNode',
        'deleteNode',
        'image',
        'icon',
        'link',
        'note',
        'tag',
        'summary',
        'associativeLine',
        'formula'
      ],
      horizontalList: [],
      verticalList: [],
      showMoreBtn: true,
      popoverShow: false
    }
  },
  computed: {
    ...mapState(['isHandleLocalFile', 'isDark'])
  },
  watch: {
    isHandleLocalFile(val) {
      if (!val) {
        ElNotification.closeAll()
      }
    }
  },
  created() {
    bus.on('write_local_file', this.onWriteLocalFile)
  },
  mounted() {
    this.computeToolbarShow()
    this.computeToolbarShowThrottle = throttle(this.computeToolbarShow, 300)
    window.addEventListener('resize', this.computeToolbarShowThrottle)
    bus.on('lang_change', this.computeToolbarShowThrottle)
  },
  beforeDestroy() {
    bus.off('write_local_file', this.onWriteLocalFile)
    window.removeEventListener('resize', this.computeToolbarShowThrottle)
    bus.off('lang_change', this.computeToolbarShowThrottle)
  },
  methods: {
    // 计算工具按钮如何显示
    computeToolbarShow() {
      const windowWidth = window.innerWidth - 40
      const all = [...this.list]
      let index = 1
      const loopCheck = () => {
        if (index > all.length) return done()
        this.horizontalList = all.slice(0, index)
        this.$nextTick(() => {
          const width = this.$refs.toolbarRef.getBoundingClientRect().width
          if (width < windowWidth) {
            index++
            loopCheck()
          } else if (index > 0 && width > windowWidth) {
            index--
            this.horizontalList = all.slice(0, index)
            done()
          }
        })
      }
      const done = () => {
        this.verticalList = all.slice(index)
        this.showMoreBtn = this.verticalList.length > 0
      }
      loopCheck()
    },
    /**
     * @Author: 黄原寅
     * @Desc: 监听本地文件读写
     */
    onWriteLocalFile(content) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.writeLocalFile(content)
      }, 1000)
    },
    /**
     * @Author: 黄原寅
     * @Desc: 打开本地文件
     */
    async openLocalFile() {
      try {
        let [_fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: '',
              accept: {
                'application/json': ['.smm']
              }
            }
          ],
          excludeAcceptAllOption: true,
          multiple: false
        })
        if (!_fileHandle) {
          return
        }
        fileHandle = _fileHandle
        if (fileHandle.kind === 'directory') {
          this.$message.warning(this.$t('toolbar.selectFileTip'))
          return
        }
        this.readFile()
      } catch (error) {
        console.log('error', error)
        if (error.toString().includes('aborted')) {
          return
        }
        this.$message.warning(this.$t('toolbar.notSupportTip'))
      }
    },

    onPainterStart() {
      this.isInPainter = true
    },

    onPainterEnd() {
      this.isInPainter = false
    },

    /**
     * @Author: 黄原寅
     * @Desc: 读取本地文件
     */
    async readFile() {
      let file = await fileHandle.getFile()
      let fileReader = new FileReader()
      fileReader.onload = async () => {
        this.$store.commit('setIsHandleLocalFile', true)
        this.setData(fileReader.result)
        ElNotification.closeAll()
        ElNotification({
          title: this.$t('toolbar.tip'),
          message: `${this.$t('toolbar.editingLocalFileTipFront')}${file.name}${this.$t('toolbar.editingLocalFileTipEnd')}`,
          duration: 0,
          showClose: true
        })
      }
      fileReader.readAsText(file)
    },

    /**
     * @Author: 黄原寅
     * @Desc: 渲染读取的数据
     */
    setData(str) {
      try {
        let data = JSON.parse(str)
        if (typeof data !== 'object') {
          throw new Error(this.$t('toolbar.fileContentError'))
        }
        if (data.root) {
          this.isFullDataFile = true
        } else {
          this.isFullDataFile = false
          data = {
            ...exampleData,
            root: data
          }
        }
        bus.emit('setData', data)
      } catch (error) {
        console.log(error)
        this.$message.error(this.$t('toolbar.fileOpenFailed'))
      }
    },

    /**
     * @Author: 黄原寅
     * @Desc: 写入本地文件
     */
    async writeLocalFile(content) {
      if (!fileHandle || !this.isHandleLocalFile) {
        return
      }
      if (!this.isFullDataFile) {
        content = content.root
      }
      let string = JSON.stringify(content)
      const writable = await fileHandle.createWritable()
      await writable.write(string)
      await writable.close()
    },

    /**
     * @Author: 黄原寅
     * @Desc: 创建本地文件
     */
    async createNewLocalFile() {
      await this.createLocalFile(exampleData)
    },

    /**
     * @Author: 黄原寅
     * @Desc: 另存为
     */
    async saveLocalFile() {
      let data = getData()
      await this.createLocalFile(data)
    },

    /**
     * @Author: 黄原寅
     * @Desc: 创建本地文件
     */
    async createLocalFile(content) {
      try {
        let _fileHandle = await window.showSaveFilePicker({
          types: [
            {
              description: '',
              accept: { 'application/json': ['.smm'] }
            }
          ],
          suggestedName: this.$t('toolbar.defaultFileName')
        })
        if (!_fileHandle) {
          return
        }
        const loading = this.$loading({
          lock: true,
          text: this.$t('toolbar.creatingTip'),
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        fileHandle = _fileHandle
        this.$store.commit('setIsHandleLocalFile', true)
        this.isFullDataFile = true
        await this.writeLocalFile(content)
        await this.readFile()
        loading.close()
      } catch (error) {
        console.log(error)
        if (error.toString().includes('aborted')) {
          return
        }
        this.$message.warning(this.$t('toolbar.notSupportTip'))
      }
    },
    emit: (...agrs) => bus.emit(...agrs),
    handleNodeBtnClick(type) {
      console.log('Button clicked:', type)
      if (type === 'link') {
        bus.emit('show_hyperlink')
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.toolbar-container {
  position: fixed;
  top: @spacing-base;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;

  .toolbar {
    display: flex;
    padding: 10px 6px;
    border-radius: 8px;
    font-family: @font-family;
    align-items: center;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(16px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05),
      0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.06);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    height: 52px;

    &:hover {
      background: #fff;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08),
        0 6px 16px rgba(0, 0, 0, 0.1);
    }

    .toolbar-group {
      position: relative;
      padding: 0 10px;
      display: flex;
      align-items: center;
      height: 100%;
      gap: 4px;

      &:not(:last-child)::after {
        content: '';
        position: absolute;
        right: 0;
        top: 15%;
        height: 70%;
        width: 1px;
        background: linear-gradient(180deg,
            transparent 0%,
            rgba(0, 0, 0, 0.08) 20%,
            rgba(0, 0, 0, 0.08) 80%,
            transparent 100%);
      }

      .toolbar-btn {
        height: 32px;
        min-width: 58px;
        padding: 0 8px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        color: rgba(0, 0, 0, 0.68);
        user-select: none;

        &:hover {
          background: rgba(0, 0, 0, 0.04);
          color: rgba(0, 0, 0, 0.88);

          .icon {
            transform: scale(1.02);
          }
        }

        &:active {
          background: rgba(0, 0, 0, 0.08);
          transform: scale(0.99);
        }

        &.primary {
          color: var(--el-color-primary);
          background: rgba(var(--el-color-primary-rgb), 0.06);

          &:hover {
            background: rgba(var(--el-color-primary-rgb), 0.1);
            color: var(--el-color-primary-dark-2);
          }

          &:active {
            background: rgba(var(--el-color-primary-rgb), 0.15);
          }
        }

        .icon {
          font-size: 13px;
          height: 14px;
          width: 14px;
          margin-right: 4px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
        }

        .text {
          font-size: 12px;
          transform: scale(0.9);
          line-height: 1;
          letter-spacing: 0.2px;
        }
      }
    }
  }

  &.isDark {
    .toolbar {
      background: rgba(28, 30, 35, 0.98);
      border-color: rgba(255, 255, 255, 0.04);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2),
        0 3px 8px rgba(0, 0, 0, 0.3);

      &:hover {
        background: rgba(35, 38, 45, 0.98);
      }

      .toolbar-group {
        &:not(:last-child)::after {
          background: linear-gradient(180deg,
              transparent 0%,
              rgba(255, 255, 255, 0.06) 20%,
              rgba(255, 255, 255, 0.06) 80%,
              transparent 100%);
        }

        .toolbar-btn {
          color: rgba(255, 255, 255, 0.8);

          &:hover {
            color: rgba(255, 255, 255, 0.95);
            background: rgba(255, 255, 255, 0.08);
          }

          &:active {
            background: rgba(255, 255, 255, 0.12);
          }

          &.primary {
            color: var(--el-color-primary-light-3);
            background: rgba(var(--el-color-primary-rgb), 0.12);

            &:hover {
              background: rgba(var(--el-color-primary-rgb), 0.16);
              color: var(--el-color-primary-light-5);
            }

            &:active {
              background: rgba(var(--el-color-primary-rgb), 0.2);
            }
          }
        }
      }
    }
  }

  @media screen and (max-width: 768px) {
    top: @spacing-small;
    padding: 0 @spacing-base;

    .toolbar {
      width: 100%;
      overflow-x: auto;
      padding: 8px 4px;
      -webkit-overflow-scrolling: touch;
      height: 48px;

      .toolbar-group {
        padding: 0 6px;
        flex-shrink: 0;
        gap: 3px;

        .toolbar-btn {
          height: 30px;
          min-width: 50px;
          padding: 0 6px;

          .icon {
            font-size: 12px;
            height: 13px;
            width: 13px;
            margin-right: 3px;
          }

          .text {
            font-size: 12px;
          }
        }
      }

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}
</style>
