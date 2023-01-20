import { randomArray, shuffle } from "./utils";

const DIRECTION = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
];

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
  constructor(x, y) {
    this.x = this.originX = x;
    this.y = this.originY = y;
    this.text = null;
    // 这个字对应的句子
    this.phrase = null;
    // 前一个，后一个
    this.from = null;
    this.next = null;
  }

  set(text, phrase) {
    this.text = text;
    this.phrase = phrase;
  }

  link_from(from) {
    this.from = from;
    from.next = this;
  }

  unset() {
    this.text = this.phrase = this.from = this.next = null;
  }

  empty() {
    return this.text === null;
  }

  getNext(gridMap) {
    return shuffle(
      DIRECTION.flatMap((direction) => {
        const [x, y, l] = [
          direction.x + this.x,
          direction.y + this.y,
          gridMap.length,
        ];
        return 0 <= x && x < l && 0 <= y && y < l && gridMap[x][y].empty()
          ? gridMap[x][y]
          : [];
      })
    );
  }
}

export class Phrase {
  // 短语
  constructor(texts) {
    this.texts = texts;
    this.length = texts.length;
    this.cells = [];
  }

  assignCell(cell) {
    const n = this.cells.length;
    cell.set(this.texts[n], this);
    if (n !== 0) cell.link_from(this.cells[n - 1]);

    this.cells.push(cell);
    return this.cells.length === this.length;
  }

  unAssign() {
    this.cells.pop().unset();
  }
}

export class Puzzle {
  // 棋盘
  constructor(phraseDict, n) {
    this.phraseDict = phraseDict;
    this.edgeLength = n;
    this.size = n * n;

    this.gridMap = Array.from(Array(n), (e) => Array(n).fill(null));
    for (let i = 0; i < n; ++i) {
      for (let j = 0; j < n; ++j) {
        this.gridMap[i][j] = new Cell(i, j);
      }
    }

    // 这个问题类型下的所有方案
    this.solutions = null;
    // 当前组成谜题的 短语phrase
    this.phraseArray = [];
  }

  generatePhraseList() {
    // 生成用于组成谜题的所有短语
    const keys = Object.keys(this.phraseDict);
    const solution = getRandomOneSolution(keys, this.size);
    this.phraseArray = solution.map(
      // TODO: 去重
      (i) => new Phrase(randomArray(this.phraseDict[i]))
    );
    return this.phraseArray;
  }

  randomPhrasePosition(phrase) {
    // 根据 gridmap 的样子随机将 短语 填充上去
    function randomDFS(current, gridMap) {
      // 随机方向的 dfs
      if (phrase.assignCell(current)) return true;

      const nexts = current.getNext(gridMap);
      for (let i = 0; i < nexts.length; ++i) {
        if (randomDFS(nexts[i], gridMap)) {
          return true;
        }
      }

      phrase.unAssign();
      return false;
    }

    // 将 cell 指向 phrase
    const shuffleMap = shuffle([].concat(...this.gridMap));
    for (let i = 0; i < shuffleMap.length; ++i) {
      if (
        randomDFS(this.gridMap[shuffleMap[i].x][shuffleMap[i].y], this.gridMap)
      )
        return phrase;
    }
    return null;
  }

  erasePhrase() {
    // 移动 cell 位置
  }
}
