<template>
  <div 
    v-if="isShow" 
    class="context-menu" 
    :class="{ isDark }"
    :style="{ left: left + 'px', top: top + 'px' }"
  >
    <template v-if="type === 'node'">
      <div class="menu-group">
        <div 
          class="menu-item" 
          :class="{ disabled: insertNodeBtnDisabled }"
          @click="exec('INSERT_NODE', insertNodeBtnDisabled)"
        >
          <span class="label">{{ $t('contextmenu.insertSiblingNode') }}</span>
          <span class="shortcut">Enter</span>
        </div>
        <div 
          class="menu-item" 
          :class="{ disabled: isGeneralization }"
          @click="exec('INSERT_CHILD_NODE')"
        >
          <span class="label">{{ $t('contextmenu.insertChildNode') }}</span>
          <span class="shortcut">Tab</span>
        </div>
        <div 
          class="menu-item"
          :class="{ disabled: insertNodeBtnDisabled }"
          @click="exec('INSERT_PARENT_NODE')"
        >
          <span class="label">{{ $t('contextmenu.insertParentNode') }}</span>
          <span class="shortcut">Shift + Tab</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="menu-group">
        <div 
          class="menu-item"
          @click="exec('COPY_NODE')"
          :class="{ disabled: isGeneralization }"
        >
          <span class="label">{{ $t('contextmenu.copyNode') }}</span>
          <span class="shortcut">Ctrl + C</span>
        </div>
        <div 
          class="menu-item"
          @click="exec('CUT_NODE')"
          :class="{ disabled: isGeneralization }"
        >
          <span class="label">{{ $t('contextmenu.cutNode') }}</span>
          <span class="shortcut">Ctrl + X</span>
        </div>
        <div 
          class="menu-item"
          @click="exec('PASTE_NODE')"
        >
          <span class="label">{{ $t('contextmenu.pasteNode') }}</span>
          <span class="shortcut">Ctrl + V</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="menu-group">
        <div 
          class="menu-item danger"
          @click="exec('REMOVE_NODE')"
        >
          <span class="label">{{ $t('contextmenu.deleteNode') }}</span>
          <span class="shortcut">Delete</span>
        </div>
      </div>
    </template>
    <template v-if="type === 'svg'">
      <div class="item" @click="exec('RETURN_CENTER')">
        <span class="name">{{ $t('contextmenu.backCenter') }}</span>
        <span class="desc">Ctrl + Enter</span>
      </div>
      <div class="item" @click="exec('EXPAND_ALL')">
        <span class="name">{{ $t('contextmenu.expandAll') }}</span>
      </div>
      <div class="item" @click="exec('UNEXPAND_ALL')">
        <span class="name">{{ $t('contextmenu.unExpandAll') }}</span>
      </div>
      <div class="item">
        <span class="name">{{ $t('contextmenu.expandTo') }}</span>
        <div class="subItems listBox" :class="{ isDark: isDark }">
          <div class="item" v-for="(item, index) in expandList" :key="item" @click="exec('UNEXPAND_TO_LEVEL', false, index + 1)">
            {{ item }}
          </div>
        </div>
      </div>
      <div class="item" @click="exec('RESET_LAYOUT')">
        <span class="name">{{ $t('contextmenu.arrangeLayout') }}</span>
        <span class="desc">Ctrl + L</span>
      </div>
      <div class="item" @click="exec('FIT_CANVAS')">
        <span class="name">{{ $t('contextmenu.fitCanvas') }}</span>
        <span class="desc">Ctrl + i</span>
      </div>
      <div class="item" @click="exec('TOGGLE_ZEN_MODE')">
        <span class="name">{{ $t('contextmenu.zenMode') }}</span>
        {{ isZenMode ? '√' : '' }}
      </div>
    </template>
  </div>
</template>

<script>
import bus from '@/utils/bus.js'
import { mapState, mapMutations } from 'vuex'
/**
 * @Author: 黄原寅
 * @Desc: 右键菜单
 */
export default {
  name: 'Contextmenu',
  props: {
    mindMap: {
      type: Object
    }
  },
  data() {
    return {
      isShow: false,
      left: 0,
      top: 0,
      node: null,
      type: '',
      isMousedown: false,
      mosuedownX: 0,
      mosuedownY: 0
    }
  },
  computed: {
    ...mapState({
      isZenMode: state => state.localConfig.isZenMode,
      isDark: state => state.isDark
    }),
    expandList() {
      return [
        this.$t('contextmenu.level1'),
        this.$t('contextmenu.level2'),
        this.$t('contextmenu.level3'),
        this.$t('contextmenu.level4'),
        this.$t('contextmenu.level5'),
        this.$t('contextmenu.level6')
      ]
    },
    insertNodeBtnDisabled() {
      return !this.node || this.node.isRoot || this.node.isGeneralization
    },
    upNodeBtnDisabled() {
      if (!this.node || this.node.isRoot || this.node.isGeneralization) {
        return true
      }
      let isFirst =
        this.node.parent.children.findIndex(item => {
          return item === this.node
        }) === 0
      return isFirst
    },
    downNodeBtnDisabled() {
      if (!this.node || this.node.isRoot || this.node.isGeneralization) {
        return true
      }
      let children = this.node.parent.children
      let isLast =
        children.findIndex(item => {
          return item === this.node
        }) ===
        children.length - 1
      return isLast
    },
    isGeneralization() {
      return this.node.isGeneralization
    },
    hasHyperlink() {
      return !!this.node.getData('hyperlink')
    },
    hasNote() {
      return !!this.node.getData('note')
    }
  },
  created() {
    bus.on('node_contextmenu', this.show)
    bus.on('node_click', this.hide)
    bus.on('draw_click', this.hide)
    bus.on('expand_btn_click', this.hide)
    bus.on('svg_mousedown', this.onMousedown)
    bus.on('mouseup', this.onMouseup)
  },
  beforeDestroy() {
    bus.off('node_contextmenu', this.show)
    bus.off('node_click', this.hide)
    bus.off('draw_click', this.hide)
    bus.off('expand_btn_click', this.hide)
    bus.off('svg_mousedown', this.onMousedown)
    bus.off('mouseup', this.onMouseup)
  },
  methods: {
    ...mapMutations(['setLocalConfig']),
    /**
     * @Author: 黄原寅
     * @Desc: 节点右键显示
     */
    // mitt只能传一个参数
    show([e, node]) {
      this.type = 'node'
      this.left = e.clientX + 10
      this.top = e.clientY + 10
      this.isShow = true
      this.node = node
    },

    /**
     * @Author: 黄原寅
     * @Desc: 鼠标按下事件
     */
    onMousedown(e) {
      if (e.which !== 3) {
        return
      }
      this.mosuedownX = e.clientX
      this.mosuedownY = e.clientY
      this.isMousedown = true
    },

    /**
     * @Author: 黄原寅
     * @Desc: 鼠标松开事件
     */
    onMouseup(e) {
      if (!this.isMousedown) {
        return
      }
      this.isMousedown = false
      if (Math.abs(this.mosuedownX - e.clientX) > 3 || Math.abs(this.mosuedownY - e.clientY) > 3) {
        this.hide()
        return
      }
      this.show2(e)
    },

    /**
     * @Author: 黄原寅
     * @Desc: 画布右键显示
     */
    show2(e) {
      this.type = 'svg'
      this.left = e.clientX + 10
      this.top = e.clientY + 10
      this.isShow = true
    },

    /**
     * @Author: 黄原寅
     * @Desc: 隐藏
     */
    hide() {
      this.isShow = false
      this.left = 0
      this.top = 0
      this.type = ''
    },

    /**
     * @Author: 黄原寅
     * @Desc: 执行命令
     */
    exec(key, disabled, ...args) {
      if (disabled) {
        return
      }
      switch (key) {
        case 'COPY_NODE':
          this.mindMap.renderer.copy()
          break
        case 'CUT_NODE':
          this.mindMap.renderer.cut()
          break
        case 'PASTE_NODE':
          this.mindMap.renderer.paste()
          break
        case 'RETURN_CENTER':
          this.mindMap.renderer.setRootNodeCenter()
          break
        case 'TOGGLE_ZEN_MODE':
          this.setLocalConfig({
            isZenMode: !this.isZenMode
          })
          break
        case 'FIT_CANVAS':
          this.mindMap.view.fit()
          break
        case 'REMOVE_HYPERLINK':
          this.node.setHyperlink('', '')
          break
        case 'REMOVE_NOTE':
          this.node.setNote('')
          break
        default:
          bus.emit('execCommand', [key, ...args])
          break
      }
      this.hide()
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.context-menu {
  position: fixed;
  min-width: 240px;
  background: @bg-white;
  border-radius: @border-radius-base;
  box-shadow: @box-shadow-base;
  border: 1px solid @border-light;
  padding: @spacing-mini 0;
  font-family: @font-family;
  z-index: 1000;

  &.isDark {
    background: rgba(31, 31, 31, 0.95);
    border-color: rgba(255, 255, 255, 0.08);

    .menu-item {
      color: rgba(255, 255, 255, 0.85);

      &:hover {
        background: rgba(255, 255, 255, 0.04);
      }

      &.disabled {
        color: rgba(255, 255, 255, 0.25);
      }

      .shortcut {
        color: rgba(255, 255, 255, 0.45);
      }
    }

    .divider {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .menu-group {
    padding: @spacing-mini 0;

    .menu-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: @spacing-small @spacing-base;
      color: @text-primary;
      cursor: pointer;
      transition: all @transition-duration;
      font-size: @font-size-base;

      &:hover {
        background: @bg-hover;
      }

      &.disabled {
        color: @text-disabled;
        cursor: not-allowed;
        pointer-events: none;
      }

      &.danger {
        color: #ff4d4f;

        &:hover {
          background: #fff1f0;
        }
      }

      .shortcut {
        margin-left: @spacing-large;
        color: @text-secondary;
        font-size: @font-size-small;
      }
    }
  }

  .divider {
    height: 1px;
    background: @border-light;
    margin: 0;
  }
}
</style>
