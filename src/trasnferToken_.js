const { Wallet, LCDClient, MnemonicKey, MsgSend } = require("@initia/initia.js");

// 创建 LCDClient 实例
const lcd = new LCDClient({
  url: "https://lcd.testnet.initia.xyz", // 替换为实际的 LCD URL
  chainID: "testnet-1", // 替换为实际的 chain ID
});

// 发起钱包的助记词
const mnemonic = "olive trim art crater electric rare gold curious include crew citizen crawl";

// 接收地址
const recipientAddress = "init12azxs59et57x4v0sund5mu25yth3uuhzqeukdx";

// 创建一个新的 MnemonicKey 实例
const key = new MnemonicKey({ mnemonic });
const wallet = lcd.wallet(key);

(async () => {
  try {
    // 创建 MsgSend 消息
    const msgSend = new MsgSend(wallet.key.accAddress, recipientAddress, {
      denom: "uinit",
      amount: "1000000", // 1.0 UNIT (uinit)
    });

    // 定义交易费用
    const fee = {
      amount: [{ denom: "uinit", amount: "5000" }],
      gas: "200000",
    };

    // 创建并签署交易
    const tx = await wallet.createAndSignTx({
      msgs: [msgSend],
      fee: fee,
    });

    // 广播交易
    const result = await lcd.tx.broadcast(tx);

    // 检查结果
    if (result.txhash) {
      console.log(`Transaction successful! TxHash: ${result.txhash}`);
    } else {
      console.log(`Transaction failed: ${result.raw_log}`);
    }
  } catch (error) {
    console.error("An error occurred during the transfer process:", error);
  }
})();
