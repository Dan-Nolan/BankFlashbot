require("dotenv").config();
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  networks: {
    gorli: {
      url: process.env.RPC,
      accounts: [process.env.COMPROMISED]
    }
  }
};
