import { readFileSync, readdirSync, writeFile } from "fs";
import { SingleBar, Presets } from "cli-progress";
import path from "path";

const DATA = "./data/";
const OUTPUT = './src/assets/data.json'
const LOWER_BOUND = 4;
const UPPER_BOUND = 9;
const RESULT = {};

function is_available(str) {
  // 只包含中文
  for (let i = 0; i < str.length; ++i) {
    if (!/^[\u4E00-\u9FA5]+$/.test(str[i])) {
      return false;
    }
  }
  // 字数限制
  return str.length >= LOWER_BOUND && str.length <= UPPER_BOUND;
}

readdirSync("./data/")
  .filter((file) => path.extname(file).toLowerCase() === ".txt")
  .forEach((file) => {
    // 读取所有，分行
    const allFileContents = readFileSync(path.join(DATA, file), "utf-8")
      .toString()
      .trim()
      .split("\n");

    const bar = new SingleBar({}, Presets.shades_classic);
    // 符合条件的存起来
    const newWords = allFileContents.flatMap((line) => {
      bar.increment();
      let tmp = line.split("\t")[0].trim();
      return is_available(tmp) ? tmp : [];
    });
    bar.stop();

    // 统计字数对应的短语
    const subResult = newWords.reduce((obj, b) => {
      if (b.length in obj) obj[b.length].push(b);
      else obj[b.length] = [b];
      return obj;
    }, {});
    const fileName = file.match(/^THUOCL_(.*)\.txt$/)[1];
    RESULT[fileName] = subResult;

    // 计数
    const countSubResult = {};
    Object.keys(subResult).forEach((key, index) => {
      countSubResult[key] = subResult[key].length;
    });
    console.log(file, countSubResult);
  });

console.log(Object.keys(RESULT));
var jsonContent = JSON.stringify(RESULT);
writeFile(OUTPUT, jsonContent, "utf8", function (err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return console.log(err);
  }
  console.log("JSON file has been saved.");
});
