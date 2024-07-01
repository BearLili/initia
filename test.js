const {
  Wallet,
  LCDClient,
  MnemonicKey,
  bcs,
  TxAPI,
} = require("@initia/initia.js");

// Base64 编码的字符串
const base64String = '8zoeAAAAAAA=';

// 解码为 Buffer
const buffer = Buffer.from(base64String, 'base64');

// 检查 buffer 的长度是否为 8 字节（64 位）
if (buffer.length !== 8) {
  throw new Error('Invalid buffer length for u64');
}

// 读取无符号 64 位整数（小端字节序）
const u64 = buffer.readBigUInt64LE(0);

console.log(u64.toString()); //
