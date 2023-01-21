import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { getAllSolutions, Puzzle } from "./puzzle.js";
import { logGridMap, randomMinMax, shuffle, mergeDict } from "./utils.js";

const data = JSON.parse(readFileSync("./src/assets/data.json"), "utf8");

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

  it("随机填充短语到棋盘", () => {
    const dict = mergeDict([data["poem"], data["chengyu"]]);
    const puzzle = new Puzzle(dict, 10);
    const phrases = puzzle.generatePhraseList();
    const phrase = phrases[0];

    puzzle.randomPhrasePosition(phrase);
    // logGridMap(puzzle.gridMap);
    let tmp = [].concat(...puzzle.gridMap).filter((i) => i.used());
    expect(tmp.length).toBe(phrase.cells.length);
    expect(tmp.length).toBe(phrase.texts.length);
    puzzle.erasePhrase(phrase);
    // logGridMap(puzzle.gridMap);
  });

  it("生成题目", () => {
    let keys = Object.keys(data);
    let puzzle = null;
    for (let i = 0; i < 100; ++i) {
      keys = shuffle(keys);
      const dict = mergeDict(keys.map((key) => data[key]));
      puzzle = new Puzzle(dict, randomMinMax(5, 6));
      puzzle.refresh();
    }
    logGridMap(puzzle.gridMap);
  });
});
