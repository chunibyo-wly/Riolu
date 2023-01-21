<script setup>
import DATA from "../assets/data.json";
import { Puzzle } from "../model/puzzle.js";
import {
  shuffle,
  mergeDict,
  randomMinMax,
  logGridMap,
} from "../model/utils.js";

const keys = shuffle(Object.keys(DATA));
const dict = mergeDict(keys.map((key) => DATA[key]));
let puzzle = new Puzzle(dict, 9);
puzzle.refresh();

logGridMap(puzzle.gridMap);
</script>

<template>
  <div class="grid-container">
    <div v-for="cell in puzzle.gridMap.flat()" class="grid-item">
      <div class="single-character">{{ cell.text }}</div>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(v-bind("puzzle.edgeLength"), 1fr);
  grid-gap: 0.5rem;
}
.grid-item {
  background-color: rgb(103, 103, 191);
  aspect-ratio: 1;

  padding: 0.2rem;
  border: 0.2rem;
  border-radius: 0.3rem;
  border-color: rgb(90, 96, 106);
  border-style: solid;
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
}
</style>
