<script setup>
import { ref } from "vue";
import DATA from "../assets/data.json";
import { Puzzle } from "../model/puzzle.js";
import { shuffle, mergeDict } from "../model/utils.js";

const keys = ["poem", "chengyu"];
const dict = mergeDict(keys.map((key) => DATA[key]));
const puzzle = ref(new Puzzle(dict, 6));
puzzle.value.canDuplicate = false;
puzzle.value.refresh();

function gridClick(cell) {
  puzzle.value.clickCell(cell);
}
</script>

<template>
  <div class="grid-container">
    <div
      v-for="cell in puzzle.gridMap.flat()"
      :class="[
        'grid-item',
        cell.highlighted && 'highlighted-item',
        cell.selected && 'selected-item',
      ]"
      :style="[!cell.used() && 'visibility:hidden']"
    >
      <div class="single-character" @click="gridClick(cell)">
        {{ cell.text }}
      </div>
    </div>
  </div>
  <button @click="puzzle.getHint()">提示</button>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(v-bind("puzzle.edgeLength"), 1fr);
  grid-gap: 0.5rem;
}

.highlighted-item,
.selected-item,
.grid-item {
  background-color: rgb(103, 103, 191);
  aspect-ratio: 1;

  padding: 0.2rem;
  border: 0.2rem;
  border-radius: 0.3rem;
  border-color: rgb(90, 96, 106);
  border-style: solid;
}

.highlighted-item {
  background-color: rgb(225, 111, 128);
  border-color: rgb(211, 177, 207);
}

.selected-item {
  background-color: rgb(224, 201, 98);
  border-color: rgb(197, 193, 172);
}
.single-character {
  color: white;
  font-size: 4vw;
  font-weight: bold;
  font-family: "LXGW";

  display: flex;
  height: 100%;
  justify-content: center; /* Align horizontal */
  align-items: center; /* Align vertical */

  user-select: none;
}
</style>
