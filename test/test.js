// const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bank", function () {
  const oneEther = ethers.utils.parseEther("1");
  let bank;
  let addr0;
  beforeEach(async () => {
    [addr0] = await ethers.provider.listAccounts();
    const Bank = await ethers.getContractFactory("Bank");
    bank = await Bank.deploy({ value: oneEther });
    await bank.deployed();
  });

  it("should change our balance", async function () {
    console.log(ethers.utils.formatEther(await ethers.provider.getBalance(addr0)));
    
    await bank.withdraw();
    
    console.log(ethers.utils.formatEther(await ethers.provider.getBalance(addr0)));
  });
});
