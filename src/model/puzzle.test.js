import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { getAllSolutions, mergeDict, Puzzle } from "./puzzle.js";
import { randomMinMax, shuffle } from "./utils.js";

const DATA = "./data/";
const data = JSON.parse(readFileSync(path.join(DATA, "data.json"), "utf8"));

describe("棋盘生成", () => {
  it("生成不同长度短语填满棋盘的所有方案", () => {
    expect(getAllSolutions([4], 6 * 6)).toStrictEqual([Array(9).fill(4)]);
  });

  it("字典合并", () => {
    const a = [
      { 1: [1, 2, 3], 2: [3] },
      { 2: [4], 3: [1] },
    ];
    const b = { 1: [1, 2, 3], 2: [3, 4], 3: [1] };

    expect(mergeDict(a)).toStrictEqual(b);
  });

  it("短语生成 1000 次", () => {
    let keys = Object.keys(data);
    for (let i = 0; i < 1000; ++i) {
      // 遍历所有短语类别
      for (let j = 0; j < keys.length; ++j) {
        for (let k = j + 1; k < keys.length; ++k) {
          // 将类别合并成一个方便处理
          const dict = mergeDict([data[keys[j]], data[keys[k]]]);
          // 棋盘大小
          for (let n = 6; n <= 10; ++n) {
            const puzzle = new Puzzle(dict, n);
            const phrases = puzzle.generatePhraseList();
            const length = phrases.reduce((a, b) => a + b.length, 0);
            expect(length).toBe(n * n);
          }
        }
      }
    }
  });

  it("短语生成 所有数据", () => {
    let keys = Object.keys(data);
    // 将类别合并成一个方便处理
    const dict = mergeDict(keys.map((key) => data[key]));
    // 棋盘大小
    for (let n = 6; n <= 10; ++n) {
      const puzzle = new Puzzle(dict, n);
      const phrases = puzzle.generatePhraseList();
      const length = phrases.reduce((a, b) => a + b.length, 0);
      expect(length).toBe(n * n);
    }
  });
});
