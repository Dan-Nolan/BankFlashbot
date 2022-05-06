async function main() {
  const Bank = await ethers.getContractFactory("Bank");
  bank = await Bank.deploy({ value: ethers.utils.parseEther(".75") });
  await bank.deployed();

  console.log("Bank deployed to:", bank.address);
}

main();