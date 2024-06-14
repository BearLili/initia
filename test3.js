const axios = require("axios");
const crypto = require("crypto");

// OKX API密钥和私钥
const apiKey = "b39eb9e0-bc16-4f89-bf2b-1f2dd4fd890f";
const secretKey = "4A0A657F9082028A1ECA489AD77CBB28";
const passphrase = "Sd@3181940";

// API URL
const proxyBaseUrl = "http://localhost:3000/api";
const withdrawApiUrl = "/api/v5/asset/withdrawal";
const balanceApiUrl = "/api/v5/account/balance";

// 提现信息
const withdrawals = [
  {
    amount: "0.025",
    dest: "4",
    toAddress: "0xafB8142A843E80081dcC64964eA9aE7f15a78Fb6",
    chain: "BNB",
  },
  {
    amount: "0.026",
    dest: "4",
    toAddress: "0x334Dd31Ca7c91c24a6aAb7A6db73B88C9C2b1841",
    chain: "BNB",
  },
];

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

// 执行提现请求
async function withdraw(withdrawal) {
  const body = JSON.stringify(withdrawal);
  const headers = createHeaders(withdrawApiUrl, "POST", body);

  try {
    const response = await axios.post(
      `${proxyBaseUrl}${withdrawApiUrl}`,
      body,
      {
        headers,
      }
    );
    console.log(`Withdrawal successful: ${response.data}`);
  } catch (error) {
    console.error(
      `Error withdrawing: ${
        error.response ? error.response.data : error.message
      }`
    );
  }
}

// 执行多个提现
async function executeWithdrawals() {
  for (const withdrawal of withdrawals) {
    await withdraw(withdrawal);
  }
}

// 执行GET请求获取账户余额
async function getBalance() {
  const headers = createHeaders(balanceApiUrl, "GET");

  try {
    const response = await axios.get(`${proxyBaseUrl}${balanceApiUrl}`, {
      headers,
      timeout: 30 * 1000,
    });
    console.log(`Account balance: ${JSON.stringify(response.data)}`);

  } catch (error) {

    console.error(
      `Error fetching balance: ${
        error.response ? error.response.data : error.message
      }`
    );
  }
}

// 开始执行获取账户余额
getBalance();

// 开始执行提现
// executeWithdrawals();
