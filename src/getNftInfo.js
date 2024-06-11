const {
  Wallet,
  LCDClient,
  MnemonicKey,
  Tx,
  TxInfo,
} = require("@initia/initia.js");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// 获取绝对路径
const keysFilePath = path.resolve(__dirname, "./../files/allkeys.xlsx");

if (!fs.existsSync(keysFilePath)) {
  throw new Error(`File not found: ${keysFilePath}`);
}

const keysWorkbook = XLSX.readFile(keysFilePath, { cellStyles: true });
const keysSheet = keysWorkbook.Sheets[keysWorkbook.SheetNames[0]];
const keysData = XLSX.utils.sheet_to_json(keysSheet, { header: 1 });

const BATCH_SIZE = 200; // 每批处理200条记录
const TOTAL_ROWS = keysData.length; // 总记录数

const lcd = new LCDClient("https://lcd.initiation-1.initia.xyz");
(async () => {
  let tx = new TxInfo({
    txhash: "8C49955D405412C874D241AFB531DF06E18DDDF6C7C57ED4463CD376260C2B31",
  });

  //   const txs = await lcd.tx.broadcast('8C49955D405412C874D241AFB531DF06E18DDDF6C7C57ED4463CD376260C2B31');
  const txs = await lcd.ibcTransfer.denomTraces();
  const nft = await lcd.ibcNft.classTraces();
  const a = nft[0].map((i) => lcd.ibcNft.classHash(i["base_class_id"]));
  debugger;
})();
