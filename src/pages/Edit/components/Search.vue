<template>
  <div class="search-container" v-show="visible" :class="{ isDark }">
    <div class="search-box">
      <el-input
        v-model="keyword"
        :placeholder="$t('search.placeholder')"
        @input="onSearch"
        ref="input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #suffix>
          <div class="search-count" v-if="total > 0">
            {{ current }}/{{ total }}
          </div>
        </template>
      </el-input>
      
      <div class="search-actions">
        <el-button-group>
          <el-button 
            :disabled="!total"
            @click="prev"
          >
            <el-icon><ArrowUp /></el-icon>
          </el-button>
          <el-button 
            :disabled="!total"
            @click="next"
          >
            <el-icon><ArrowDown /></el-icon>
          </el-button>
        </el-button-group>
        <el-button @click="close">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import bus from '@/utils/bus.js'
import { Close, Search, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { isUndef } from 'simple-mind-map/src/utils/index'
// 搜索替换
export default {
  name: 'Search2',
  components: {
    Close,
    Search,
    ArrowUp,
    ArrowDown
  },
  props: {
    mindMap: {
      type: Object
    }
  },
  data() {
    return {
      show: false,
      searchText: '',
      replaceText: '',
      showReplaceInput: false,
      currentIndex: 0,
      total: 0,
      showSearchInfo: false,
      keyword: '',
      current: 0,
      total: 0,
      visible: false
    }
  },
  computed: {
    ...mapState(['isDark', 'isReadonly'])
  },
  watch: {
    searchText() {
      if (isUndef(this.searchText)) {
        this.currentIndex = 0
        this.total = 0
        this.showSearchInfo = false
      }
    }
  },
  created() {
    bus.on('show_search', this.showSearch)
    this.mindMap.on('search_info_change', this.handleSearchInfoChange)
    this.mindMap.keyCommand.addShortcut('Control+f', this.showSearch)
  },
  beforeDestroy() {
    bus.off('show_search', this.showSearch)
    this.mindMap.off('search_info_change', this.handleSearchInfoChange)
    this.mindMap.keyCommand.removeShortcut('Control+f', this.showSearch)
  },
  methods: {
    isUndef,
    handleSearchInfoChange(data) {
      this.currentIndex = data.currentIndex + 1
      this.total = data.total
      this.showSearchInfo = true
    },
    showSearch() {
      bus.emit('closeSideBar')
      this.show = true
      this.visible = true
      // this.$refs.searchInputRef.focus()
    },
    hideReplaceInput() {
      this.showReplaceInput = false
      this.replaceText = ''
    },
    onMouseleave() {
      if (this.$refs.searchInputRef) {
        this.$refs.searchInputRef.blur()
      }
      if (this.$refs.replaceInputRef) {
        this.$refs.replaceInputRef.blur()
      }
    },
    onSearchNext() {
      this.mindMap.search.search(this.searchText, () => {
        this.$refs.searchInputRef.focus()
      })
    },
    replace() {
      this.mindMap.search.replace(this.replaceText, true)
    },
    replaceAll() {
      this.mindMap.search.replaceAll(this.replaceText)
    },
    close() {
      this.show = false
      this.showSearchInfo = false
      this.total = 0
      this.currentIndex = 0
      this.searchText = ''
      this.hideReplaceInput()
      this.mindMap.search.endSearch()
      this.visible = false
    },
    onSearch() {
      this.mindMap.search.search(this.keyword, () => {
        this.$refs.input.focus()
      })
    },
    prev() {
      this.mindMap.search.prev()
    },
    next() {
      this.mindMap.search.next()
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.search-container {
  position: fixed;
  top: @spacing-large;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;

  .search-box {
    display: flex;
    align-items: center;
    gap: @spacing-small;
    padding: @spacing-small;
    background: @bg-white;
    border-radius: @border-radius-base;
    box-shadow: @box-shadow-base;
    border: 1px solid @border-light;
    backdrop-filter: blur(8px);

    :deep(.el-input) {
      width: 320px;

      .el-input__wrapper {
        box-shadow: none;
        background: transparent;
      }
    }

    .search-count {
      font-size: @font-size-small;
      color: @text-secondary;
      padding: 0 @spacing-small;
    }

    .search-actions {
      display: flex;
      gap: @spacing-small;
    }
  }

  &.isDark {
    .search-box {
      background: rgba(31, 31, 31, 0.8);
      border-color: rgba(255, 255, 255, 0.08);

      :deep(.el-input) {
        .el-input__wrapper {
          background: transparent;
        }
      }
    }
  }
}
</style>
