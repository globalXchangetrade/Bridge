/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

 require("dotenv").config();
 const HDWalletProvider = require('@truffle/hdwallet-provider');
 const fs = require('fs');

module.exports = {
  plugins: [
    'truffle-plugin-verify'
  ],

  api_keys: {
    etherscan:'8DX3P4NKATHAUPHDHRQBWVAFG9DEC7YUN6'
    //polygonscan: 'GBJK79Z1NAJ42ZZQNJDRV9QKHZ2BVVV7IC',
    //bscscan:'B3WJVG5X5XYCXZDIAX9A6TGJ1KNMVMPIS3'
  },

  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    matic: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://rpc-mumbai.maticvigil.com`),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      pollingInterval:1800000,
      disableConfirmationListener:true
    },
    bsctestnet: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://data-seed-prebsc-1-s1.binance.org:8545`),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
      pollingInterval:1800000,
      disableConfirmationListener:true
    },
    rinkeby: {
      // provider: function() { 
      //  return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/<INFURA_Access_Token>");
      // },
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000,
  }
  },

  compilers: {
    solc: {
       version: "0.8.8",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },

  // Truffle DB is currently disabled by default; to enable it, change enabled:
  // false to enabled: true. The default storage location can also be
  // overridden by specifying the adapter settings, as shown in the commented code below.
  //
  // NOTE: It is not possible to migrate your contracts to truffle DB and you should
  // make a backup of your artifacts to a safe location before enabling this feature.
  //
  // After you backed up your artifacts you can utilize db by running migrate as follows: 
  // $ truffle migrate --reset --compile-all
  //
  // db: {
    // enabled: false,
    // host: "127.0.0.1",
    // adapter: {
    //   name: "sqlite",
    //   settings: {
    //     directory: ".db"
    //   }
    // }
  // }
};
