<script setup lang="ts">
import { onMounted } from "vue";
import { initCanvas } from "../scripts/can";

onMounted(initCanvas);
</script>

<template>
  <canvas id="canvas-bg"> </canvas>
</template>

<style>
#canvas-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  width: 100vw;
  height: 100vh;

  @media screen and (max-width: 480px) {
      display: none;
  }
}
</style>
