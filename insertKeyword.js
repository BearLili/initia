const XLSX = require("xlsx");

// 读取 Excel 文件
const initiaWorkbook = XLSX.readFile("./files/initia.xlsx");
const keysWorkbook = XLSX.readFile("./files/keys.xlsx");

// 获取工作表
const initiaSheet = initiaWorkbook.Sheets[initiaWorkbook.SheetNames[0]];
const keysSheet = keysWorkbook.Sheets[keysWorkbook.SheetNames[0]];

// 将工作表转换为 JSON 对象
const initiaData = XLSX.utils.sheet_to_json(initiaSheet);
const keysData = XLSX.utils.sheet_to_json(keysSheet);

// 创建一个用于查找的字典
const keysDict = {};
keysData.forEach((row, index) => {
  keysDict[index + 2] = row["key"]; // 假设 keysSheet 中的列名为 'key'
});

// 添加 N 列数据
initiaData.forEach((row) => {
  const webid = row["webid"];
  if (keysDict.hasOwnProperty(webid)) {
    row["keyword"] = keysDict[webid];
  }
});

// 将修改后的数据转换回工作表
const newInitiaSheet = XLSX.utils.json_to_sheet(initiaData);

// 创建一个新的工作簿并附加工作表
const newWorkbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWorkbook, newInitiaSheet, "Sheet1");

// 保存新的 Excel 文件
XLSX.writeFile(newWorkbook, "./modified_initia.xlsx");
