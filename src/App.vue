<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'

const app = getCurrentInstance()
if (app) {
  app.appContext.config.warnHandler = () => null
}
console.log = () => { }
console.info = () => { }
console.warn = () => { }
console.error = () => { }
console.debug = () => { }
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
