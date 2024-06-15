const axios = require("axios");
const headerHandle = require("./createHeader");

// API URL
const baseUrl = "https://www.okx.com";
// const balanceApiUrl = "/api/v5/asset/balances";
const balanceApiUrl = "/api/v5/asset/currencies?ccy=BNB"


// 执行GET请求获取账户余额
async function getBalance() {
  const headers = headerHandle.createHeaders(balanceApiUrl, "GET");

  try {
    console.log(`${baseUrl}${balanceApiUrl}`);
    const response = await axios.get(`${baseUrl}${balanceApiUrl}`, {
      headers,
    });
    console.info(`Account balance: ${JSON.stringify(response.data)}`);
  } catch (error) {
    debugger
    console.error(`Error fetching balance: ${error.response.data}`);
  }
}

// 开始执行获取账户余额
getBalance();
