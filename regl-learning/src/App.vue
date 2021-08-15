<template>
<div></div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { test } from './scripts/test'
export default class App extends Vue {
  mounted () {
    test()
  }
}
</script>

<style>
</style>
