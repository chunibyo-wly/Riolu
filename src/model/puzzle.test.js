import { expect, it } from "vitest";
import { getAllSolutions } from "./puzzle.js";

it("生成不同长度短语填满棋盘的所有方案", () => {
  expect(getAllSolutions([4], 6 * 6)).toStrictEqual([Array(9).fill(4)]);
});
