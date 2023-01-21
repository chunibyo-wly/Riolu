import { logGridMap, randomArray, shuffle, swap } from "./utils";

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
  constructor(x, y, disable = false) {
    this.x = this.originX = x;
    this.y = this.originY = y;
    this.text = disable ? -1 : 0;

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

  update(x, y) {
    [this.x, this.y] = [x, y];
  }

  link_from(from) {
    this.from = from;
    from.next = this;
  }

  unset() {
    this.text = 0;
    this.phrase = this.from = this.next = null;
  }

  empty() {
    return this.text === 0;
  }

  disabled() {
    return this.text === -1;
  }

  used() {
    return /^[\u4E00-\u9FA5]+$/.test(this.text);
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

    this.gravity = { x: 1, y: -1 };

    this.gridMap = Array.from(Array(n), (e) => Array(n).fill(null));
    this.clearGridMap();

    // 这个问题类型下的所有方案
    this.solutions = null;
    // 当前组成谜题的 短语phrase
    this.phraseArray = [];
  }

  clearGridMap() {
    for (let i = 0; i < this.edgeLength; ++i) {
      for (let j = 0; j < this.edgeLength; ++j) {
        this.gridMap[i][j] = new Cell(i, j);
      }
    }
  }
  generatePhraseList() {
    // 生成用于组成谜题的所有短语
    const keys = Object.keys(this.phraseDict);
    const solution = getRandomOneSolution(keys, this.size);
    this.phraseArray = solution
      .map(
        // TODO: 去重
        (i) => new Phrase(randomArray(this.phraseDict[i]))
      )
      .sort((a, b) => a.texts > b.texts);
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

    const shuffleMap = shuffle(
      [].concat(...this.gridMap).filter((grid) => grid.empty())
    );
    for (let i = 0; i < shuffleMap.length; ++i) {
      if (
        randomDFS(this.gridMap[shuffleMap[i].x][shuffleMap[i].y], this.gridMap)
      )
        return phrase;
    }
    return null;
  }

  cellPosUpdate() {
    const n = this.edgeLength;
    for (let i = 0; i < n; ++i) {
      for (let j = 0; j < n; ++j) {
        this.gridMap[i][j].update(i, j);
      }
    }
  }

  erasePhrase(phrase) {
    // TODO: 重构逻辑
    // 移动 cell 位置
    const n = this.edgeLength;

    phrase.cells.forEach((cell) => {
      this.gridMap[cell.x][cell.y] = new Cell(cell.x, cell.y, true);
    });

    // 沿 y 轴遍历每一行
    for (let j = 0; j < n; ++j) {
      for (let i = n - 1; i >= 0; --i) {
        if (this.gridMap[i][j].disabled()) continue;
        for (let k = i + 1; k < n; k++) {
          if (!this.gridMap[k][j].disabled()) break;
          [this.gridMap[k - 1][j], this.gridMap[k][j]] = [
            this.gridMap[k][j],
            this.gridMap[k - 1][j],
          ];
        }
      }
    }

    // 沿 x 轴遍历每一行
    for (let i = 0; i < n; ++i) {
      for (let j = 0; j < n; ++j) {
        if (this.gridMap[i][j].disabled()) continue;
        for (let k = j - 1; k >= 0; --k) {
          if (!this.gridMap[i][k].disabled()) break;
          [this.gridMap[i][k], this.gridMap[i][k + 1]] = [
            this.gridMap[i][k + 1],
            this.gridMap[i][k],
          ];
        }
      }
    }

    this.cellPosUpdate();
  }

  refresh() {
    // TODO: 还会有不可解的情况, 先用工程办法解决
    let flag = false;
    let phrases = [];
    while (!flag) {
      flag = true;
      this.clearGridMap();

      phrases = this.generatePhraseList();
      phrases.forEach((phrase) => {
        this.randomPhrasePosition(phrase);
        let tmp = [].concat(...this.gridMap).filter((i) => i.used());
        flag =
          flag &&
          tmp.length === phrase.cells.length &&
          tmp.length === phrase.texts.length;
        this.erasePhrase(phrase);
      });
    }

    phrases.forEach((phrase) => {
      phrase.cells.forEach((cell) => {
        this.gridMap[cell.originX][cell.originY] = cell;
      });
    });
    this.cellPosUpdate();
  }
}
