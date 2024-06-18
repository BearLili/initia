const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// 获取绝对路径
const keysFilePath = path.resolve(__dirname, "./info_6.17.xlsx");

if (!fs.existsSync(keysFilePath)) {
  throw new Error(`File not found: ${keysFilePath}`);
}

const keysWorkbook = XLSX.readFile(keysFilePath, { cellStyles: true });
const keysSheet = keysWorkbook.Sheets[keysWorkbook.SheetNames[0]];
const keysData = XLSX.utils.sheet_to_json(keysSheet, { header: 1 });

const strArray1 = Array.from({ length: 1160 }, (_, index) => index + 1);
const strArray2 = keysData.map((row, index) => {
  return row[0];
});

function removeItems(arr1, arr2) {
  return arr1.filter((item) => !arr2.includes(item));
}

const resultArray = removeItems(strArray1, strArray2);

// 记录结果到日志文件
const logFile = path.resolve(__dirname, "./webId.txt");
const logStream = fs.createWriteStream(logFile, { flags: "a" });
logStream.write(resultArray.join(","));
