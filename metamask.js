const bip39 = require("bip39");
const { hdkey } = require("ethereumjs-wallet");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// 获取绝对路径
const keysFilePath = path.resolve(__dirname, "./files/keys.xlsx");

if (!fs.existsSync(keysFilePath)) {
  throw new Error(`File not found: ${keysFilePath}`);
}

const keysWorkbook = XLSX.readFile(keysFilePath, { cellStyles: true });
const keysSheet = keysWorkbook.Sheets[keysWorkbook.SheetNames[0]];
const keysData = XLSX.utils.sheet_to_json(keysSheet, { header: 1 });

const resultArray = keysData.map((row) => {
  // 生成12位助记词
  const mnemonic = row[0];
  console.log(`助记词: ${mnemonic}`);

  // 使用助记词生成种子
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  // 从种子生成HD钱包
  const hdWallet = hdkey.fromMasterSeed(seed);

  // 生成MetaMask默认路径的HD路径（m/44'/60'/0'/0/0）
  const path = "m/44'/60'/0'/0/0";
  const wallet = hdWallet.derivePath(path).getWallet();

  // 获取地址和私钥
  const address = `0x${wallet.getAddress().toString("hex")}`;
  const privateKey = wallet.getPrivateKey().toString("hex");

  console.log(`地址: ${address}`);
  console.log(`私钥: ${privateKey}`);
  return address + "|" + privateKey;
});

// 记录结果到日志文件
const logFile = path.resolve(__dirname, "./webId.txt");
const logStream = fs.createWriteStream(logFile, { flags: "a" });
logStream.write(resultArray.join("\n"));
