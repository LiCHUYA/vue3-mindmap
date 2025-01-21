<template>
  <div class="toolbar-node-list" :class="[dir, { isDark }]">
    <template v-for="item in list" :key="item">
      <!-- 撤销/重做 -->
      <div v-if="item === 'back'" class="toolbar-btn" :class="{ disabled: readonly || backEnd }"
        @click="emit('execCommand', 'BACK')" title="撤销 (Ctrl+Z)">
        <span class="icon iconfont iconhoutui-shi"></span>
        <span class="text">{{ $t('toolbar.undo') }}</span>
      </div>
      <div v-if="item === 'forward'" class="toolbar-btn" :class="{ disabled: readonly || forwardEnd }"
        @click="emit('execCommand', 'FORWARD')" title="重做 (Ctrl+Y)">
        <span class="icon iconfont iconqianjin1"></span>
        <span class="text">{{ $t('toolbar.redo') }}</span>
      </div>

      <!-- 节点操作 -->
      <div v-if="item === 'painter'" class="toolbar-btn" :class="{
        disabled: activeNodes.length <= 0 || hasGeneralization,
        active: isInPainter
      }" @click="emit('startPainter')" title="格式刷">
        <span class="icon iconfont iconjiedian"></span>
        <span class="text">{{ $t('toolbar.painter') }}</span>
      </div>
      <div v-if="item === 'siblingNode'" class="toolbar-btn"
        :class="{ disabled: activeNodes.length <= 0 || hasRoot || hasGeneralization }"
        @click="emit('execCommand', 'INSERT_NODE')" title="插入同级节点 (Enter)">
        <span class="icon iconfont iconjiedian"></span>
        <span class="text">{{ $t('toolbar.insertSiblingNode') }}</span>
      </div>
      <div v-if="item === 'childNode'" class="toolbar-btn"
        :class="{ disabled: activeNodes.length <= 0 || hasGeneralization }"
        @click="emit('execCommand', 'INSERT_CHILD_NODE')" title="插入子节点 (Tab)">
        <span class="icon iconfont icontianjiazijiedian"></span>
        <span class="text">{{ $t('toolbar.insertChildNode') }}</span>
      </div>
      <div v-if="item === 'deleteNode'" class="toolbar-btn danger" :class="{ disabled: activeNodes.length <= 0 }"
        @click="emit('execCommand', 'REMOVE_NODE')" title="删除节点 (Delete)">
        <span class="icon iconfont iconshanchu"></span>
        <span class="text">{{ $t('toolbar.deleteNode') }}</span>
      </div>

      <!-- 节点样式 -->
      <div v-if="item === 'image'" class="toolbar-btn" :class="{ disabled: activeNodes.length <= 0 }"
        @click="emit('showNodeImage')" title="插入图片">
        <span class="icon iconfont iconimage"></span>
        <span class="text">{{ $t('toolbar.image') }}</span>
      </div>
      <div v-if="item === 'icon'" class="toolbar-btn" :class="{ disabled: activeNodes.length <= 0 }"
        @click="showNodeIcon" title="插入图标">
        <span class="icon iconfont iconxiaolian"></span>
        <span class="text">{{ $t('toolbar.icon') }}</span>
      </div>
      <div v-if="item === 'link'" class="toolbar-btn" :class="{ disabled: activeNodes.length <= 0 }"
        @click="emit('showNodeHyperlink')" title="添加超链接">
        <span class="icon iconfont iconchaolianjie"></span>
        <span class="text">{{ $t('toolbar.link') }}</span>
      </div>
      <div v-if="item === 'note'" class="toolbar-btn" :class="{ disabled: activeNodes.length <= 0 }"
        @click="emit('showNodeNote')" title="添加备注">
        <span class="icon iconfont iconbeizhu"></span>
        <span class="text">{{ $t('toolbar.note') }}</span>
      </div>
      <div v-if="item === 'tag'" class="toolbar-btn" :class="{ disabled: activeNodes.length <= 0 }"
        @click="emit('showNodeTag')" title="添加标签">
        <span class="icon iconfont iconbiaoqian"></span>
        <span class="text">{{ $t('toolbar.tag') }}</span>
      </div>

      <!-- 高级功能 -->
      <div v-if="item === 'summary'" class="toolbar-btn"
        :class="{ disabled: activeNodes.length <= 0 || hasRoot || hasGeneralization }"
        @click="emit('execCommand', 'ADD_GENERALIZATION')" title="添加概要">
        <span class="icon iconfont icongaikuozonglan"></span>
        <span class="text">{{ $t('toolbar.summary') }}</span>
      </div>
      <div v-if="item === 'associativeLine'" class="toolbar-btn"
        :class="{ disabled: activeNodes.length <= 0 || hasGeneralization }" @click="emit('createAssociativeLine')"
        title="添加关联线">
        <span class="icon iconfont iconlianjiexian"></span>
        <span class="text">{{ $t('toolbar.associativeLine') }}</span>
      </div>
      <div v-if="item === 'formula'" class="toolbar-btn"
        :class="{ disabled: activeNodes.length <= 0 || hasGeneralization }" @click="showFormula" title="插入公式">
        <span class="icon iconfont icongongshi"></span>
        <span class="text">{{ $t('toolbar.formula') }}</span>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import bus from '@/utils/bus.js'

export default {
  props: {
    dir: {
      type: String,
      default: 'h' // h（水平排列）、v（垂直排列）
    },
    list: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      activeNodes: [],
      backEnd: false,
      forwardEnd: true,
      readonly: false,
      isFullDataFile: false,
      timer: null,
      isInPainter: false
    }
  },
  computed: {
    ...mapState(['isDark']),
    hasRoot() {
      return (
        this.activeNodes.findIndex(node => {
          return node.isRoot
        }) !== -1
      )
    },
    hasGeneralization() {
      return (
        this.activeNodes.findIndex(node => {
          return node.isGeneralization
        }) !== -1
      )
    }
  },
  created() {
    bus.on('mode_change', this.onModeChange)
    bus.on('node_active', this.onNodeActive)
    bus.on('back_forward', this.onBackForward)
    bus.on('painter_start', this.onPainterStart)
    bus.on('painter_end', this.onPainterEnd)
  },
  beforeDestroy() {
    bus.off('mode_change', this.onModeChange)
    bus.off('node_active', this.onNodeActive)
    bus.off('back_forward', this.onBackForward)
    bus.off('painter_start', this.onPainterStart)
    bus.off('painter_end', this.onPainterEnd)
  },
  methods: {
    ...mapMutations(['setActiveSidebar']),
    // 监听模式切换
    onModeChange(mode) {
      this.readonly = mode === 'readonly'
    },
    // 监听节点激活
    onNodeActive(args) {
      this.activeNodes = [...args[1]]
    },
    // 监听前进后退
    onBackForward(index, len) {
      this.backEnd = index <= 0
      this.forwardEnd = index >= len - 1
    },
    // 开始格式刷
    onPainterStart() {
      this.isInPainter = true
    },
    // 格式刷结束
    onPainterEnd() {
      this.isInPainter = false
    },
    // 显示节点图标侧边栏
    showNodeIcon() {
      bus.emit('close_node_icon_toolbar')
      this.setActiveSidebar('nodeIconSidebar')
    },
    // 打开公式侧边栏
    showFormula() {
      this.setActiveSidebar('formulaSidebar')
    },
    emit: (...agrs) => bus.emit(...agrs)
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.toolbar-node-list {
  display: flex;
  gap: @spacing-small;

  &.isDark {
    .toolbar-btn {
      color: rgba(255, 255, 255, 0.85);

      &:hover {
        color: rgba(255, 255, 255, 1);
        background: rgba(255, 255, 255, 0.04);
      }

      &.active {
        color: @primary-color;
        background: fade(@primary-color, 15%);
      }

      &.disabled {
        color: rgba(255, 255, 255, 0.25);
      }
    }
  }

  .toolbar-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: @spacing-mini @spacing-small;
    border-radius: @border-radius-small;
    cursor: pointer;
    transition: all @transition-duration cubic-bezier(0.4, 0, 0.2, 1);
    color: @text-regular;
    position: relative;

    &:hover {
      color: @text-primary;
      background: @bg-hover;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    }

    &.active {
      color: @primary-color;
      background: fade(@primary-color, 10%);

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 25%;
        width: 50%;
        height: 2px;
        background: @primary-color;
        border-radius: 1px;
      }
    }

    &.disabled {
      color: @text-disabled;
      cursor: not-allowed;
      pointer-events: none;
    }

    &.danger {
      &:hover {
        color: #ff4d4f;
        background: fade(#ff4d4f, 10%);
      }

      &.active {
        color: #ff4d4f;
        background: fade(#ff4d4f, 15%);

        &::after {
          background: #ff4d4f;
        }
      }
    }

    &:hover::after {
      opacity: 1;
      transform: translateY(0);
    }

    &:active {
      transform: translateY(1px);
    }

    .icon {
      font-size: 18px;
      margin-bottom: @spacing-mini;
      transition: transform @transition-duration;
    }

    &:hover .icon {
      transform: scale(1.15);
    }

    .text {
      font-size: @font-size-small;
      white-space: nowrap;
      transform: scale(0.9);
    }
  }

  &.v {
    flex-direction: column;
    gap: @spacing-mini;

    .toolbar-btn {
      flex-direction: row;
      justify-content: flex-start;
      width: 100%;
      padding: @spacing-small @spacing-base;

      &:hover {
        transform: translateX(4px);
        box-shadow: none;
      }

      .icon {
        margin-right: @spacing-small;
        margin-bottom: 0;
        font-size: 16px;
      }

      .text {
        flex: 1;
        text-align: left;
        transform: none;
      }

      &::after {
        left: 0;
        bottom: 0;
        width: 2px;
        height: 50%;
        top: 25%;
      }
    }
  }
}
</style>
