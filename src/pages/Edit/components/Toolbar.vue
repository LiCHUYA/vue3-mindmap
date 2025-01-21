<template>
  <div class="toolbar-container" :class="{ isDark }">
    <div class="toolbar" ref="toolbarRef">
      <!-- 基础操作组 -->
      <div class="toolbar-group">
        <div class="toolbar-btn primary" @click="createNewLocalFile" title="新建文件">
          <span class="icon iconfont iconxinjian"></span>
          <span class="text">{{ $t('toolbar.newFile') }}</span>
        </div>
        <div class="toolbar-btn" @click="openLocalFile" title="打开文件">
          <span class="icon iconfont icondakai"></span>
          <span class="text">{{ $t('toolbar.openFile') }}</span>
        </div>
        <div class="toolbar-btn" @click="saveLocalFile" title="另存为">
          <span class="icon iconfont iconlingcunwei"></span>
          <span class="text">{{ $t('toolbar.saveAs') }}</span>
        </div>
      </div>

      <!-- 节点操作组 -->
      <div class="toolbar-group">
        <ToolbarNodeBtnList :list="horizontalList" />
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
        <div class="toolbar-btn" @click="emit('showImport')" title="导入">
          <span class="icon iconfont icondaoru"></span>
          <span class="text">{{ $t('toolbar.import') }}</span>
        </div>
        <div class="toolbar-btn" @click="emit('showExport')" title="导出">
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
    emit: (...agrs) => bus.emit(...agrs)
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
    padding: @spacing-mini @spacing-base;
    border-radius: @border-radius-base;
    font-family: @font-family;
    align-items: center;
    height: 56px;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(12px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid @border-light;

    .toolbar-group {
      display: flex;
      padding: 0;
      margin: 0 @spacing-mini;
      position: relative;
      height: 100%;
      align-items: center;

      &::after {
        content: '';
        position: absolute;
        right: -@spacing-base;
        top: 20%;
        height: 60%;
        width: 1px;
        background: linear-gradient(180deg,
            transparent 0%,
            fade(@border-color, 60%) 20%,
            fade(@border-color, 60%) 80%,
            transparent 100%);
        opacity: 0.8;
      }

      &:first-child {
        margin-left: 0;
      }

      &:last-child {
        margin-right: 0;

        &::after {
          display: none;
        }
      }

      .toolbar-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: @spacing-mini @spacing-mini;
        border-radius: @border-radius-small;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
        color: @text-regular;
        position: relative;
        width: 64px;
        height: 100%;
        margin: 0 2px;

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          transform: translate(-50%, -50%);
          transition: background-color 0.2s;
          border-radius: @border-radius-small;
        }

        &:hover {
          color: @text-primary;

          &::before {
            background: fade(@primary-color, 6%);
          }

          .icon {
            transform: scale(1.1);
          }
        }

        &.active {
          color: @primary-color;

          &::before {
            background: fade(@primary-color, 10%);
          }

          &::after {
            content: '';
            position: absolute;
            bottom: 4px;
            left: 50%;
            width: 24px;
            height: 2px;
            background: @primary-color;
            border-radius: 2px 2px 0 0;
            transform: translateX(-50%);
          }
        }

        &.disabled {
          color: @text-disabled;
          cursor: not-allowed;
          pointer-events: none;
          opacity: 0.5;
        }

        .icon {
          font-size: 18px;
          height: 20px;
          width: 20px;
          margin-bottom: 2px;
          transition: transform 0.2s ease;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          color: inherit;
          position: relative;
          z-index: 1;
        }

        .text {
          font-size: @font-size-small;
          white-space: nowrap;
          position: relative;
          z-index: 1;
          transform: scale(0.85);
          transform-origin: center;
        }
      }
    }
  }

  &.isDark {
    .toolbar {
      background: rgba(24, 24, 28, 0.98);
      border-color: rgba(255, 255, 255, 0.08);

      .toolbar-group {
        border-color: rgba(255, 255, 255, 0.08);

        &::after {
          background: linear-gradient(180deg,
              transparent 0%,
              rgba(255, 255, 255, 0.08) 20%,
              rgba(255, 255, 255, 0.08) 80%,
              transparent 100%);
        }

        .toolbar-btn {
          color: rgba(255, 255, 255, 0.85);

          &:hover {
            color: rgba(255, 255, 255, 1);

            &::before {
              background: fade(@primary-color, 15%);
            }
          }
        }
      }
    }
  }

  @media screen and (max-width: 768px) {
    .toolbar-container {
      top: @spacing-small;
      padding: 0 @spacing-base;

      .toolbar {
        width: 100%;
        overflow-x: auto;
        padding: @spacing-mini;

        .toolbar-group {
          flex-shrink: 0;
          margin: 0 @spacing-mini;

          .toolbar-btn {
            width: 56px;
          }
        }
      }
    }
  }
}
</style>
