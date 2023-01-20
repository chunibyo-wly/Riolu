import { randomArray, shuffle } from "./utils";

export function getAllSolutions(baseNumberList, amount) {
  // 获取所有方案，性能较差
  const result = [];

  function dfs(currentAmount, currentSolution) {
    if (0 == currentAmount) {
      result.push([...currentSolution]);
    } else {
      for (let i = 0; i < baseNumberList.length; ++i) {
        const tmp = baseNumberList[i];
        if (tmp > currentAmount) break;

        currentSolution.push(tmp);
        dfs(currentAmount - tmp, currentSolution);
        currentSolution.pop();
      }
    }
  }

  baseNumberList.sort();
  dfs(amount, []);
  return result;
}

export function getRandomOneSolution(baseNumberList, amount) {
  // 随机拿一种方案
  function dfs(currentAmount, currentSolution) {
    if (0 === currentAmount) {
      return currentSolution;
    } else {
      const newArray = shuffle(baseNumberList);
      for (let i = 0; i < baseNumberList.length; ++i) {
        const tmp = newArray[i];
        if (tmp > currentAmount) continue;
        currentSolution.push(tmp);
        if (dfs(currentAmount - tmp, currentSolution) != null)
          return currentSolution;
        currentSolution.pop();
      }
    }
    return null;
  }

  return dfs(amount, []);
}

export function mergeDict(dictArray) {
  const result = { ...dictArray[0] };
  for (let i = 1; i < dictArray.length; ++i) {
    for (let key in dictArray[i]) {
      if (key in result) result[key] = [...result[key], ...dictArray[i][key]];
      else result[key] = [...dictArray[i][key]];
    }
  }
  return result;
}

export class Cell {
  constructor(originPos) {
    this.originPos = originPos;
    this.text = null;

    // 前一个，后一个
    // 这个字对应的句子
  }
}

export class Phrase {
  // 短语
  constructor(texts) {
    this.texts = texts;
    this.length = texts.length;
    this.cells = [];
  }
}

export class Puzzle {
  // 棋盘
  constructor(phraseDict, n) {
    this.phraseDict = phraseDict;
    this.edgeLength = n;
    this.size = n * n;

    this.gridMap = Array.from(Array(n), (e) => Array(n).fill(0));
    // 这个问题类型下的所有方案
    this.solutions = null;
    // 当前组成谜题的 短语phrase
    this.phraseArray = [];
  }

  generatePhraseList() {
    const keys = Object.keys(this.phraseDict);
    const solution = getRandomOneSolution(keys, this.size);
    this.phraseArray = solution.map(
      // TODO: 去重
      (i) => new Phrase(randomArray(this.phraseDict[i]))
    );
    return this.phraseArray;
  }

  randomPhrasePosition() {
    // 将 cell 指向 phrase
  }

  erasePhrase() {
    // 移动 cell 位置
  }
}
