const XLSX = require("xlsx");

// 读取 Excel 文件
const keysWorkbook = XLSX.readFile("./keys_new.xlsx");

// 获取工作表
const keysSheet = keysWorkbook.Sheets[keysWorkbook.SheetNames[0]];

// 将工作表转换为 JSON 对象
const keysData = XLSX.utils.sheet_to_json(keysSheet);

// 添加 N 列数据
keysData.forEach((row, index) => {
  row["webid"] = index + 1;
});

// 将修改后的数据转换回工作表
const newInitiaSheet = XLSX.utils.json_to_sheet(keysData);

// 创建一个新的工作簿并附加工作表
const newWorkbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWorkbook, newInitiaSheet, "Sheet1");

// 保存新的 Excel 文件
XLSX.writeFile(newWorkbook, "./keys_new_1.xlsx");
