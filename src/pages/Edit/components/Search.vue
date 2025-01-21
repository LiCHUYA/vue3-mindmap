<template>
  <div class="search-container" v-show="visible" :class="{ isDark }" @click.self="close" @mousedown.stop>
    <div class="search-box">
      <el-input v-model="keyword" :placeholder="$t('输入点什么....')" @input="onSearch" ref="input" autofocus>
        <template #prefix>
          <el-icon class="search-icon">
            <Search />
          </el-icon>
        </template>
        <template #suffix>
          <div class="search-count" v-if="total > 0">
            {{ current }}/{{ total }}
          </div>
        </template>
      </el-input>

      <div class="search-actions">
        <el-button-group>
          <el-button :disabled="!total" @click="prev" class="nav-btn">
            <el-icon>
              <ArrowUp />
            </el-icon>
          </el-button>
          <el-button :disabled="!total" @click="next" class="nav-btn">
            <el-icon>
              <ArrowDown />
            </el-icon>
          </el-button>
        </el-button-group>
        <el-button @click="close" class="close-btn">
          <el-icon>
            <Close />
          </el-icon>
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
      document.body.classList.add('search-active')
      this.$nextTick(() => {
        this.$refs.input.focus()
      })
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
      document.body.classList.remove('search-active')
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
.search-container {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  animation: fadeIn 0.2s cubic-bezier(0.08, 0.82, 0.17, 1);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: -1;
  }

  .search-box {
    width: 520px;
    background: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transform-origin: center top;
    animation: zoomIn 0.2s cubic-bezier(0.08, 0.82, 0.17, 1);
    position: relative;
    top: 100px;

    :deep(.el-input) {
      .el-input__wrapper {
        padding: 12px 16px;
        box-shadow: none !important;
        background: transparent;
        border: none;
        border-bottom: 1px solid var(--el-border-color-lighter);
        transition: all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);

        &:hover,
        &.is-focus {
          background: rgba(0, 0, 0, 0.015);
        }

        .el-input__prefix {
          margin-right: 12px;

          .search-icon {
            font-size: 16px;
            color: #bfbfbf;
            transition: color 0.3s;
          }
        }

        &.is-focus .search-icon {
          color: var(--el-color-primary);
        }

        .el-input__inner {
          font-size: 14px;
          height: 24px;
          line-height: 24px;
          color: var(--el-text-color-primary);

          &::placeholder {
            color: #bfbfbf;
          }
        }
      }
    }

    .search-count {
      padding: 0 8px;
      font-size: 12px;
      color: #8c8c8c;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 10px;
      height: 20px;
      line-height: 20px;
    }

    .search-actions {
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fafafa;
      border-top: 1px solid var(--el-border-color-lighter);

      .el-button-group {
        .nav-btn {
          padding: 5px 8px;
          height: 28px;
          border-color: #d9d9d9;
          transition: all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);

          &:not(:disabled):hover {
            color: var(--el-color-primary);
            border-color: var(--el-color-primary);
            background: #fff;
          }

          &:disabled {
            cursor: not-allowed;
            color: rgba(0, 0, 0, 0.25);
            border-color: #d9d9d9;
            background: #f5f5f5;
          }

          .el-icon {
            font-size: 14px;
          }
        }
      }

      .close-btn {
        padding: 5px 8px;
        height: 28px;
        border-radius: 4px;
        border-color: #d9d9d9;
        transition: all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);

        &:hover {
          color: #ff4d4f;
          border-color: #ff4d4f;
          background: #fff1f0;
        }

        .el-icon {
          font-size: 14px;
        }
      }
    }
  }

  &.isDark {
    background: rgba(0, 0, 0, 0.65);

    .search-box {
      background: #141414;
      border-color: #434343;
      box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.3);

      :deep(.el-input) {
        .el-input__wrapper {
          border-color: #434343;

          &:hover,
          &.is-focus {
            background: rgba(255, 255, 255, 0.04);
          }

          .search-icon {
            color: rgba(255, 255, 255, 0.3);
          }

          &.is-focus .search-icon {
            color: var(--el-color-primary);
          }

          .el-input__inner {
            &::placeholder {
              color: rgba(255, 255, 255, 0.3);
            }
          }
        }
      }

      .search-count {
        color: rgba(255, 255, 255, 0.45);
        background: rgba(255, 255, 255, 0.04);
      }

      .search-actions {
        background: #1f1f1f;
        border-color: #434343;

        .nav-btn {
          border-color: #434343;
          color: rgba(255, 255, 255, 0.65);

          &:not(:disabled):hover {
            color: var(--el-color-primary);
            border-color: var(--el-color-primary);
            background: transparent;
          }

          &:disabled {
            color: rgba(255, 255, 255, 0.3);
            border-color: #434343;
            background: rgba(255, 255, 255, 0.08);
          }
        }

        .close-btn {
          border-color: #434343;
          color: rgba(255, 255, 255, 0.65);

          &:hover {
            color: #ff4d4f;
            border-color: #ff4d4f;
            background: #2a1215;
          }
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

:global(body.search-active) {
  overflow: hidden;
  pointer-events: none;

  .search-container {
    pointer-events: auto;
  }
}
</style>
