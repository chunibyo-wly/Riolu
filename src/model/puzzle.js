import { logGridMap, randomArray, shuffle } from "./utils";

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

    this.selected = false;
    this.changed = false;
    this.highlighted = false;
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

  select() {
    this.selected = !this.selected;
  }

  unselect() {
    this.selected = false;
  }

  distance(cell) {
    return Math.abs(cell.x - this.x) + Math.abs(cell.y - this.y) <= 1;
  }

  isLinked() {
    if (this.from === null) this.from = this;
    if (this.next === null) this.next = this;
    return this.distance(this.from) && this.distance(this.next);
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
    return false;
  }

  doesPhraseSplitGridMap(gridMap) {
    let flatMap = gridMap.flat().filter((cell) => cell.empty());
    return (
      flatMap.some((i) => this.cells.some((j) => i.x <= j.x && i.y <= j.y)) &&
      flatMap.some((i) => this.cells.some((j) => i.x >= j.x && i.y >= j.y))
    );
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

    this.canDuplicate = true;
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
    const tmp = new Set();
    let texts = "";
    this.phraseArray = solution
      .map(
        // TODO: 去重
        (i) => {
          do {
            texts = randomArray(this.phraseDict[i]);
          } while (
            !this.canDuplicate &&
            this.edgeLength <= 6 &&
            [...texts].some((item) => tmp.has(item))
          );
          [...texts].forEach((item) => tmp.add(item));
          return new Phrase(texts);
        }
      )
      .sort((a, b) => b.length - a.length);
    return this.phraseArray;
  }

  fillGridMapWithPhrases() {
    this.phraseArray.forEach((phrase) => {
      phrase.cells.forEach((cell) => {
        this.gridMap[cell.originX][cell.originY] = cell;
      });
    });
    this.cellPosUpdate();
  }

  randomPhrasePosition(phrase, index) {
    let [gridMap, length] = [this.gridMap, this.phraseArray.length];
    // 根据 gridmap 的样子随机将 短语 填充上去
    function randomDFS(current) {
      // 随机方向的 dfs
      if (phrase.assignCell(current)) {
        if (index < length - 1) {
          if (phrase.cells.every((cell) => cell.changed))
            return phrase.unAssign();
          if (!phrase.doesPhraseSplitGridMap(gridMap)) return phrase.unAssign();
        }
        return true;
      }

      const nexts = current.getNext(gridMap);
      for (let i = 0; i < nexts.length; ++i) {
        if (randomDFS(nexts[i], gridMap)) {
          return true;
        }
      }

      return phrase.unAssign();
    }

    let shuffleMap = shuffle(
      this.gridMap.flat().filter((grid) => grid.empty())
    );
    if (index !== 0) {
      shuffleMap = shuffleMap.filter((cell) => cell.changed);
      if (shuffleMap.length === 0) return null;
    }

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

  eraseCells(cells) {
    cells.forEach((cell) => {
      this.gridMap[cell.x][cell.y] = new Cell(cell.x, cell.y, true);
    });

    const n = this.edgeLength;
    // 沿 y 轴遍历每一行
    for (let j = 0; j < n; ++j) {
      for (let i = n - 1; i >= 0; --i) {
        if (this.gridMap[i][j].disabled()) continue;
        for (let k = i + 1; k < n; k++) {
          if (!this.gridMap[k][j].disabled()) break;
          this.gridMap[k - 1][j].changed = true;
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
          this.gridMap[i][k + 1].changed = true;
          [this.gridMap[i][k], this.gridMap[i][k + 1]] = [
            this.gridMap[i][k + 1],
            this.gridMap[i][k],
          ];
        }
      }
    }

    this.cellPosUpdate();
  }

  erasePhrase(phrase) {
    this.gridMap.flat().forEach((cell) => (cell.changed = false));
    this.eraseCells(phrase.cells);
  }

  refresh() {
    // TODO: 还会有不可解的情况, 先用工程办法解决
    let flag = false;
    let phrases = [];
    while (!flag) {
      while (!flag) {
        this.clearGridMap();

        phrases = this.generatePhraseList();
        flag = phrases.every((phrase, index) => {
          if (this.randomPhrasePosition(phrase, index) === null) return false;
          let tmp = [].concat(...this.gridMap).filter((i) => i.used());
          if (tmp.length !== phrase.cells.length) return false;
          if (tmp.length !== phrase.texts.length) return false;
          this.erasePhrase(phrase);
          return true;
        });
      }

      this.fillGridMapWithPhrases();
      if (!this.checkGridMapAvailable()) flag = false;
    }

    console.log(phrases.map((phrase) => phrase.texts));
  }

  checkGridMapAvailable() {
    let flag = true;
    let n = this.phraseArray.length;
    for (let i = 0; i < n && flag; ++i) {
      if (!this.completeOnePhrase(this.phraseArray[i].cells)) {
        flag = false;
        break;
      }
      for (let j = i + 1; j < n; ++j) {
        if (this.completeOnePhrase(this.phraseArray[j].cells)) {
          flag = false;
          break;
        }
      }
      this.eraseCells(this.phraseArray[i].cells);
    }
    if (flag) this.fillGridMapWithPhrases();
    return flag;
  }

  clickCell(cell) {
    cell.select();
    const selectedCells = this.gridMap.flat().filter((cell) => cell.selected);
    if (selectedCells.length <= 1) return;

    if (!this.checkAvailable(selectedCells)) {
      this.unselectAll();
    } else if (this.completeOnePhrase(selectedCells)) {
      this.eraseCells(selectedCells);
      if (this.gridMap.flat().filter((cell) => cell.used()).length === 0) {
        this.refresh();
      }
    }
  }

  unselectAll() {
    this.gridMap.flat().map((cell) => cell.unselect());
  }

  checkAvailable(cells) {
    const phrase = cells[0].phrase;
    for (let i = 1; i < cells.length; ++i) {
      if (!phrase.cells.includes(cells[i])) return false;
    }
    return true;
  }

  completeOnePhrase(cells) {
    const phrase = cells[0].phrase;
    if (phrase.length !== cells.length) return false;
    return cells.every((cell) => cell.used() && cell.isLinked());
  }

  getHint() {
    let num = this.gridMap.flat().filter((cell) => cell.used()).length;
    let i = 0;
    while (num < this.edgeLength * this.edgeLength) {
      num += this.phraseArray[i].length;
      i++;
    }
    this.phraseArray[i].cells.forEach((cell) => (cell.highlighted = true));
  }
}
