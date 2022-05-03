const Bridge = artifacts.require("Bridge");

module.exports = function (deployer) {
  //Binance 0xee1fb970faf38647289900d2b990685beff45d69
  //Polygon 0x4039f5f14f1530bdeda410bdf7eee10ac47a7389
  deployer.deploy(Bridge, '0x4039f5f14f1530bdeda410bdf7eee10ac47a7389', '0xfD2d6909915E91b8D2d140Ed6c58F8770A73DE91');
};
