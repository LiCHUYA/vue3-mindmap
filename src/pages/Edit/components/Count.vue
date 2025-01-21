<template>
  <div class="count-container" :class="{ isDark }">
    <div class="count-item">
      <span class="label">{{ $t('count.words') }}</span>
      <span class="value">{{ words }}</span>
    </div>
    <div class="divider"></div>
    <div class="count-item">
      <span class="label">{{ $t('count.nodes') }}</span>
      <span class="value">{{ num }}</span>
    </div>
  </div>
</template>

<script>
import bus from '@/utils/bus.js'
import { mapState } from 'vuex'
/**
 * @Author: 黄原寅
 * @Desc: 字数及节点数量统计
 */
let countEl = document.createElement('div')
export default {
  name: 'Count',
  props: {
    mindMap: {
      type: Object
    }
  },
  data() {
    return {
      textStr: '',
      words: 0,
      num: 0
    }
  },
  computed: {
    ...mapState(['isDark'])
  },
  created() {
    bus.on('data_change', this.onDataChange)
    if (this.mindMap) {
      this.onDataChange(this.mindMap.getData())
    }
  },
  beforeDestroy() {
    bus.off('data_change', this.onDataChange)
  },
  methods: {
    /**
     * @Author: 黄原寅
     * @Desc: 监听数据变化
     */
    onDataChange(data) {
      this.textStr = ''
      this.words = 0
      this.num = 0
      this.walk(data)
      countEl.innerHTML = this.textStr
      this.words = countEl.textContent.length
    },
    /**
     * @Author: 黄原寅
     * @Desc: 遍历
     */
    walk(data) {
      this.num++
      this.textStr += String(data.data.text) || ''
      if (data.children && data.children.length > 0) {
        data.children.forEach(item => {
          this.walk(item)
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.count-container {
  position: fixed;
  left: @spacing-large;
  bottom: @spacing-large;
  display: flex;
  align-items: center;
  padding: @spacing-small @spacing-base;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: @border-radius-base;
  box-shadow: @box-shadow-small;
  border: 1px solid @border-light;
  font-family: @font-family;

  &.isDark {
    background: rgba(31, 31, 31, 0.8);
    border-color: rgba(255, 255, 255, 0.08);

    .count-item {
      color: rgba(255, 255, 255, 0.85);
    }

    .divider {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .count-item {
    display: flex;
    align-items: center;
    color: @text-regular;
    font-size: @font-size-small;

    .label {
      margin-right: @spacing-small;
    }

    .value {
      font-weight: 500;
      color: @text-primary;
    }
  }

  .divider {
    width: 1px;
    height: 12px;
    background: @border-light;
    margin: 0 @spacing-base;
  }
}

@media screen and (max-width: 740px) {
  .count-container {
    display: none;
  }
}
</style>
