const logger = Moralis.Cloud.getLogger();

const web3Main = Moralis.web3ByChain("0x61"); // BSC Testnet
const web3Side = Moralis.web3ByChain("0x13881"); // Mumbai Testnet

const MainBridge_address = "0xcE5759e919782EfD5f8f27e789E5500835129565";
const SideBridge_address = "0x30C3Db44cfc3aA6b9D2d7458877F2a23C067F247";
const mainToken_address = "0xee1fb970faf38647289900d2b990685beff45d69";
const childToken_address = "0x4039f5f14f1530bdeda410bdf7eee10ac47a7389";
const gateway_address = "0xfD2d6909915E91b8D2d140Ed6c58F8770A73DE91";
const gatewayKey = "";
const MainBridge_abi = '[{"inputs":[{"internalType":"address","name":"_mainToken","type":"address"},{"internalType":"address","name":"_gateway","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"requester","type":"address"},{"indexed":true,"internalType":"bytes32","name":"sideDepositHash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"TokensReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"requester","type":"address"},{"indexed":true,"internalType":"bytes32","name":"mainDepositHash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"TokensSent","type":"event"},{"inputs":[{"internalType":"address","name":"_requester","type":"address"},{"internalType":"uint256","name":"_bridgedAmount","type":"uint256"},{"internalType":"bytes32","name":"_sideDepositHash","type":"bytes32"}],"name":"receiveTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_requester","type":"address"},{"internalType":"uint256","name":"_bridgedAmount","type":"uint256"},{"internalType":"bytes32","name":"_mainDepositHash","type":"bytes32"}],"name":"sendTokens","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
const SideBridge_abi = '[{"inputs":[{"internalType":"address","name":"_mainToken","type":"address"},{"internalType":"address","name":"_gateway","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"requester","type":"address"},{"indexed":true,"internalType":"bytes32","name":"sideDepositHash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"TokensReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"requester","type":"address"},{"indexed":true,"internalType":"bytes32","name":"mainDepositHash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"TokensSent","type":"event"},{"inputs":[{"internalType":"address","name":"_requester","type":"address"},{"internalType":"uint256","name":"_bridgedAmount","type":"uint256"},{"internalType":"bytes32","name":"_sideDepositHash","type":"bytes32"}],"name":"receiveTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_requester","type":"address"},{"internalType":"uint256","name":"_bridgedAmount","type":"uint256"},{"internalType":"bytes32","name":"_mainDepositHash","type":"bytes32"}],"name":"sendTokens","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
const MainBridge = new web3Main.eth.Contract(JSON.parse(MainBridge_abi),MainBridge_address);
const SideBridge = new web3Side.eth.Contract(JSON.parse(SideBridge_abi),SideBridge_address);

Moralis.Cloud.afterSave("BscTokenTransfers", (request) => {
    const data = JSON.parse(JSON.stringify(request.object, ["token_address", "to_address", "from_address","transaction_hash","value", "confirmed"]));
    logger.info(data);
    if (data["token_address"] == mainToken_address.toLocaleLowerCase() && data["to_address"] == MainBridge_address.toLocaleLowerCase() && !data["confirmed"]) {
        const txlock = processBridgeRequestLock(data);
        const txbridge = processBridgeRequestBridge(data);
    }
    else{
        logger.info("transaction not related to bridge");
    }
    async function processBridgeRequestLock(data) {
        logger.info("bridging starting locking tokens");
        const functionCall = MainBridge.methods.sendTokens(data["from_address"],data["value"],data["transaction_hash"]).encodeABI();
        const gatewayNonce = web3Main.eth.getTransactionCount(gateway_address);
        const transactionBody = {
            to: MainBridge_address,
            nonce:gatewayNonce,
            data:functionCall,
            gas:400000,
            gasPrice:web3Main.utils.toWei("2", "gwei")
        }
        signedTransaction = await web3Main.eth.accounts.signTransaction(transactionBody,gatewayKey);
        logger.info(signedTransaction.transactionHash);
        fulfillTx = await web3Main.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        logger.info("fulfillTx: " + JSON.stringify(fulfillTx));
    }
    async function processBridgeRequestBridge(data) {
        logger.info("bridging tokens");
        const functionCall = SideBridge.methods.receiveTokens(data["from_address"],data["value"],data["transaction_hash"]).encodeABI();
        const gatewayNonce = web3Side.eth.getTransactionCount(gateway_address);
        const transactionBody = {
            to: SideBridge_address,
              nonce:gatewayNonce,
              data:functionCall,
              gas:400000,
              gasPrice:web3Side.utils.toWei("2", "gwei")
        }
        signedTransaction = await web3Side.eth.accounts.signTransaction(transactionBody,gatewayKey);
        logger.info(signedTransaction.transactionHash);
        fulfillTx = await web3Side.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        logger.info("fulfillTx: " + JSON.stringify(fulfillTx))
        return fulfillTx;
    }
});


Moralis.Cloud.afterSave("PolygonTokenTransfers", (request) => {
    const data = JSON.parse(JSON.stringify(request.object, ["token_address", "to_address", "from_address","transaction_hash","value", "confirmed"]));
    logger.info(data);
    if (data["token_address"] == childToken_address.toLocaleLowerCase() && data["to_address"] == SideBridge_address.toLocaleLowerCase() && !data["confirmed"]) {
        const txlock = processReturnBurn(data);
        const txbridge = processReturnUnlock(data);
    }
    else{
        logger.info("transaction not related to bridge");
    }
    async function processReturnBurn(data) {
        logger.info("returning tokens burning");
        const functionCall = SideBridge.methods.sendTokens(data["from_address"],data["value"],data["transaction_hash"]).encodeABI();
        const gatewayNonce = web3Side.eth.getTransactionCount(gateway_address);
        const transactionBody = {
            to: SideBridge_address,
              nonce:gatewayNonce,
              data:functionCall,
              gas:400000,
              gasPrice:web3Side.utils.toWei("2", "gwei")
        }
        signedTransaction = await web3Side.eth.accounts.signTransaction(transactionBody,gatewayKey);
        logger.info(signedTransaction.transactionHash);
        fulfillTx = await web3Side.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        logger.info("fulfillTx: " + JSON.stringify(fulfillTx))
        return fulfillTx;
    }
    async function processReturnUnlock(data) {
        logger.info("returning starting unlocking tokens");
        const functionCall = MainBridge.methods.receiveTokens(data["from_address"],data["value"],data["transaction_hash"]).encodeABI();
        const gatewayNonce = web3Main.eth.getTransactionCount(gateway_address);
        const transactionBody = {
            to: MainBridge_address,
              nonce:gatewayNonce,
              data:functionCall,
              gas:400000,
              gasPrice:web3Main.utils.toWei("2", "gwei")
        }
        signedTransaction = await web3Main.eth.accounts.signTransaction(transactionBody,gatewayKey);
        logger.info(signedTransaction.transactionHash);
        fulfillTx = await web3Main.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        logger.info("fulfillTx: " + JSON.stringify(fulfillTx));
    }
});



