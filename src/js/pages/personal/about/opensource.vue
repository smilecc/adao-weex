<template>
  <scroller class="page">
    <wxc-cell title="Weex"></wxc-cell>
    <wxc-cell title="Eros"></wxc-cell>
    <wxc-cell title="Weex UI"></wxc-cell>
    <wxc-cell title="Weex Action Sheet"></wxc-cell>
    <wxc-cell title="Weex Image Picker"></wxc-cell>
    <wxc-cell title="ZLPhotoBrowser"></wxc-cell>
  </scroller>
</template>

<script>
import { WxcCell } from 'weex-ui'
export default {
  components: {
    WxcCell
  }
}
</script>

<style>
.page {
  border-top-style: solid;
  border-top-color: #dfdfdf;
  border-top-width: 1px;
}
</style>
