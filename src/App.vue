<script setup>
import Grid from "./components/Grid.vue";
</script>

<template>
  <div id="container">
    <Grid></Grid>
  </div>
</template>

<style>
#container {
  /* TODO: 不知道怎么计算这个 */
  max-width: 80vh;
  margin: auto;
  padding: 0.5rem;
}

@font-face {
  font-family: "LXGW";
  src: url("./assets/LXGWWenKai-Regular.ttf");
}
</style>
