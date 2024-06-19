const axios = require("axios");
const crypto = require("crypto");

// OKX API密钥和私钥
// const apiKey = "b39eb9e0-bc16-4f89-bf2b-1f2dd4fd890f";
// const secretKey = "4A0A657F9082028A1ECA489AD77CBB28";
const apiKey = "7c939fcd-d2db-4f25-871f-f7c47047b1b2";
const secretKey = "5800B05958C2BC331E7B14EE7DEEA5F4";
const passphrase = "Sd@3181940";

// 创建请求头
function createHeaders(requestPath, method, body = "") {
  const timestamp = new Date().toISOString();
  const signString = `${timestamp}${method}${requestPath}${body}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(signString)
    .digest("base64");

  return {
    "OK-ACCESS-KEY": apiKey,
    "OK-ACCESS-SIGN": signature,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": passphrase,
    "Content-Type": "application/json",
  };
}

module.exports = { createHeaders };
