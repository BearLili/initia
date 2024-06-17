const { Spot } = require("@binance/connector");

const apiKey =
  "LfHU0xhDWdwRuEvEuFNweM3Aa0pTaRpWLjXtpxVxC7ByTriWId6iLNtQS0idarLT";
const apiSecret =
  "YFrZk5b4KxTIvJ3lWGH9wuLmVjffGSHhPDwGdv01HunpW9Y8DFqx3RckwM8muz59";
const client = new Spot(apiKey, apiSecret);

// Get account information
// client.account().then(response => client.logger.log(response.data))

// client
//   .signRequest("GET", "/sapi/v1/capital/config/getall")
//   .then((response) =>
//     client.logger.log(
//       response.data?.[3].networkList.map((i) => JSON.stringify(i))
//     )
//   );

// client
//   .signRequest("POST", "/sapi/v1/asset/get-funding-asset", {
//     timestamp: new Date().getTime(),
//   })
//   .then((response) => client.logger.log(response.data));

// client
//   .signRequest("GET", "/sapi/v1/capital/withdraw/address/list")
//   .then((response) => client.logger.log(response.data));

// client
//   .signRequest("POST", "/sapi/v1/account/enableFastWithdrawSwitch", {
//     timestamp: new Date().getTime(),
//   })
//   .then((response) => client.logger.log(response.data));

client
  .signRequest("POST", "/sapi/v1/capital/withdraw/apply", {
    coin: "USDT",
    walletType: 1,
    network: "BSC",
    amount: 0.35,
    address: "0x44888703a147927ca1e179ae3f0b7fa926080ff6",
    timestamp: new Date().getTime(),
  })
  .then((response) => client.logger.log(response.data));

//   userUniversalTransfer
