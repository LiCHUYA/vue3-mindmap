<template>
  <div class="color-container" :class="{ isDark }">
    <div class="color-grid">
      <div
        v-for="item in colorList"
        :key="item"
        class="color-item"
        :style="{ backgroundColor: item }"
        :class="{ 
          'is-transparent': item === 'transparent',
          'is-active': color === item 
        }"
        @click="clickColorItem(item)"
      ></div>
    </div>
    <div class="color-picker">
      <span class="label">{{ $t('color.moreColor') }}</span>
      <el-color-picker 
        v-model="selectColor" 
        size="small"
        :predefine="colorList"
        @change="changeColor"
      />
    </div>
  </div>
</template>

<script>
import { colorList } from '@/config'
import { mapState } from 'vuex'

/**
 * @Author: 黄原寅
 * @Desc: 颜色选择器
 */
export default {
  name: 'Color',
  props: {
    color: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      colorList,
      selectColor: ''
    }
  },
  computed: {
    ...mapState(['isDark'])
  },
  watch: {
    color() {
      this.selectColor = this.color
    }
  },
  created() {
    this.selectColor = this.color
  },
  methods: {
    /**
     * @Author: 黄原寅
     * @Desc: 点击预设颜色
     */
    clickColorItem(color) {
      this.$emit('change', color)
    },

    /**
     * @Author: 黄原寅
     * @Desc: 修改颜色
     */
    changeColor() {
      this.$emit('change', this.selectColor)
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.color-container {
  padding: @spacing-base;
  border-radius: @border-radius-base;
  background: @bg-white;
  
  &.isDark {
    background: @bg-dark;
    
    .color-picker {
      .label {
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: @spacing-small;
    margin-bottom: @spacing-base;

    .color-item {
      position: relative;
      padding-bottom: 100%;
      border-radius: @border-radius-small;
      cursor: pointer;
      transition: all @transition-duration;
      border: 2px solid transparent;

      &.is-transparent {
        background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
          linear-gradient(-45deg, #ccc 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #ccc 75%),
          linear-gradient(-45deg, transparent 75%, #ccc 75%);
        background-size: 10px 10px;
        background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
      }

      &.is-active {
        border-color: @primary-color;
        transform: scale(1.1);
      }

      &:hover {
        transform: scale(1.1);
        box-shadow: @box-shadow-small;
      }
    }
  }

  .color-picker {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: @spacing-small;
    border-top: 1px solid @border-light;

    .label {
      font-size: @font-size-small;
      color: @text-secondary;
    }
  }
}
</style>
