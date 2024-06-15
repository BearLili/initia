const axios = require("axios");
const headerHandle = require("./createHeader");

// API URL
const baseUrl = "https://www.okx.com";
const withdrawApiUrl = "/api/v5/asset/withdrawal";

// 提现信息
const withdrawals = [
  {
    amt: "0.003",
    fee: "0.002",
    dest: "4",
    ccy: "BNB",
    chain: "BNB-BSC",
    toAddr: "0x334Dd31Ca7c91c24a6aAb7A6db73B88C9C2b1841",
  },
  {
    amt: "0.004",
    fee: "0.002",
    dest: "4",
    ccy: "BNB",
    chain: "BNB-BSC",
    toAddr: "0xafB8142A843E80081dcC64964eA9aE7f15a78Fb6",
  },
];

// 执行提现请求
async function withdraw(withdrawal) {
  const body = JSON.stringify(withdrawal);
  const headers = headerHandle.createHeaders(withdrawApiUrl, "POST", body);

  try {
    const response = await axios.post(`${baseUrl}${withdrawApiUrl}`, body, {
      headers,
    });
    console.log(`Withdrawal successful: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error(
      `Error withdrawing: ${JSON.stringify(error?.response?.data)}`
    );
  }
}

// 执行多个提现
async function executeWithdrawals() {
  for (const withdrawal of withdrawals) {
    await withdraw(withdrawal);
  }
}

// 开始执行提现
executeWithdrawals();
