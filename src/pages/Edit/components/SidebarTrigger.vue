<template>
  <div class="sidebarTriggerContainer" @click.stop
    :class="{ hasActive: show && activeSidebar, show: show, isDark: isDark }">
    <div class="toggleShowBtn" :class="{ hide: !show }" @click="show = !show">
      <span class="iconfont iconjiantouyou"></span>
    </div>
    <div class="trigger">
      <div class="triggerItem" v-for="item in triggerList" :key="item.value"
        :class="{ active: activeSidebar === item.value }" @click="trigger(item)">
        <div class="triggerIcon iconfont" :class="[item.icon]"></div>
        <div class="triggerName">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { sidebarTriggerList } from '@/config'
/**
 * @Author: 黄原寅
 * @Desc: 侧边栏触发器
 */
export default {
  name: 'SidebarTrigger',
  data() {
    return {
      show: true
    }
  },
  computed: {
    ...mapState(['activeSidebar', 'isDark']),
    triggerList() {
      return sidebarTriggerList[this.$i18n.locale] || sidebarTriggerList.zh
    }
  },
  methods: {
    ...mapMutations(['setActiveSidebar']),
    trigger(item) {
      this.setActiveSidebar(item.value)
    }
  }
}
</script>

<style lang="less" scoped>
.sidebarTriggerContainer {
  position: fixed;
  right: -64px;
  // margin-top: 110px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;

  &.isDark {
    .trigger {
      background-color: rgba(38, 42, 46, 0.85);
      backdrop-filter: blur(8px);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);

      .triggerItem {
        color: rgba(255, 255, 255, 0.85);

        &:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 1);
        }

        &.active {
          background-color: rgba(64, 158, 255, 0.15);
          color: #409eff;
        }
      }
    }

    .toggleShowBtn {
      background: rgba(64, 158, 255, 0.9);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

      &:hover {
        background: rgba(64, 158, 255, 1);
      }

      span {
        color: rgba(255, 255, 255, 0.95);
      }
    }
  }

  &.show {
    right: 0;
  }

  &.hasActive {
    right: 305px;
  }

  .toggleShowBtn {
    position: absolute;
    left: -24px;
    width: 24px;
    height: 48px;
    background: #409eff;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 0;
    border-radius: 6px 0 0 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
    backdrop-filter: blur(8px);

    &.hide {
      left: -8px;

      span {
        transform: rotateZ(180deg);
      }
    }

    &:hover {
      left: -28px;
      background: #66b1ff;
      width: 28px;

      span {
        transform: scale(1.1);
      }
    }

    span {
      color: #fff;
      transition: all 0.2s ease;
      font-size: 12px;
    }
  }

  .trigger {
    position: relative;
    width: 64px;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    overflow: hidden;
    padding: 8px 0;

    .triggerItem {
      height: 56px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: rgba(0, 0, 0, 0.65);
      user-select: none;
      white-space: nowrap;
      transition: all 0.2s ease;
      margin: 2px 6px;
      border-radius: 6px;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 2px;
        background: #409eff;
        opacity: 0;
        transform: scaleX(0.5);
        transition: all 0.2s ease;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
        color: rgba(0, 0, 0, 0.85);

        .triggerIcon {
          transform: translateY(-2px);
        }
      }

      &.active {
        color: #409eff;
        font-weight: 500;
        background-color: rgba(64, 158, 255, 0.1);

        &::after {
          opacity: 1;
          transform: scaleX(0.6);
        }

        .triggerIcon {
          transform: scale(1.1);
        }
      }

      .triggerIcon {
        font-size: 20px;
        margin-bottom: 4px;
        transition: all 0.2s ease;
      }

      .triggerName {
        font-size: 12px;
        transition: all 0.2s ease;
        opacity: 0.9;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .sidebarTriggerContainer {
    .trigger {
      background-color: rgba(255, 255, 255, 0.98);
    }

    &.hasActive {
      right: 0;

      .trigger {
        display: none;
      }
    }
  }
}
</style>
