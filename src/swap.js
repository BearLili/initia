import { LCDClient, Wallet, MnemonicKey, MsgExecute } from '@initia/initia.js';

const lcd = new LCDClient('https://lcd.initiation-1.initia.xyz', {
    chainId: 'initiation-1',
    gasPrices: '0.15move/944f8dd8dc49f96c25fea9849f16436dcfa6d564eec802f3ef7f8b3ea85368ff',
    gasAdjustment: '2.0',
});
const key = new MnemonicKey({
    mnemonic: "<MNEMONIC>",
});
const wallet = new Wallet(lcd, key);
const msg = new MsgExecute(
    key.accAddress,
    '0x1',
    'dex',
    'swap_script',
	undefined,
	["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","AAAAAAAAAAA=","AQAAAAAAAAAA"]
);

const execute = async () => {
    const signedTx = await wallet.createAndSignTx({
        msgs: [msg],
    });

    const broadcastResult = await lcd.tx.broadcast(signedTx);
    console.log(broadcastResult);
};
execute();