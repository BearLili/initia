const { MnemonicKey, bcs, LCDClient } = require("@initia/initia.js");

const lcd = new LCDClient("https://lcd.initiation-1.initia.xyz", {
  chainId: "initiation-1",
});
(async () => {
  let keyword =
    "exhaust hollow someone express portion tiny rain frost head young nominee panic";
  const key = new MnemonicKey({
    mnemonic: keyword,
  });

  let accAddress = key.accAddress;
  const _address = bcs.address().serialize(accAddress).toBase64(); // arguments, BCS-encoded
  const viewResult = await lcd.move.viewFunction(
    "0x9065fda28f52bb14ade545411f02e8e07a9cb4ba",
    "jennie",
    "get_jennie_state",
    undefined,
    [_address]
  );
  console.log(viewResult?.update_at > 1719367200);
})();
