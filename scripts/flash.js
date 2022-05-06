require("dotenv").config();
const ethers = require("ethers");
const { FlashbotsBundleProvider } = require("@flashbots/ethers-provider-bundle");

// TODO: post BANK_ADDR
const BANK_ADDR = "";

async function recoverFunds() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC);

    const compromisedWallet = new ethers.Wallet(process.env.COMPROMISED, provider);
    const funderWallet = new ethers.Wallet(process.env.NOT_COMPROMISED, provider);

    const flashbotsProvider = await FlashbotsBundleProvider.create(
        provider,
        compromisedWallet,
        'https://relay-goerli.flashbots.net/',
        'goerli'
    );

    const gasPrice = ethers.utils.parseUnits("1", "gwei");

    const fundTransaction = await funderWallet.signTransaction({
        nonce: await funderWallet.getTransactionCount(),
        to: compromisedWallet.address,
        gasPrice,
        gasLimit: 21000,
        value: ethers.utils.parseEther(".1")
    });

    const abi = ["function withdraw() external"]
    const bankContract = new ethers.Contract(BANK_ADDR, abi, compromisedWallet);
    const nonce = await compromisedWallet.getTransactionCount();
    const withdrawTx = await bankContract.populateTransaction.withdraw({
        nonce,
        gasLimit: await bankContract.estimateGas.withdraw(),
        gasPrice,
        value: 0
    });

    const fundTransaction2 = await compromisedWallet.signTransaction({
        nonce: nonce + 1,
        to: funderWallet.address,
        gasPrice,
        gasLimit: 21000,
        value: ethers.utils.parseEther(".75")
    });

    const transactionBundle = [{
        signedTransaction: fundTransaction
    }, {
        signer: compromisedWallet,
        transaction: withdrawTx
    }, {
        signedTransaction: fundTransaction2
    }];

    const signedBundle = await flashbotsProvider.signBundle(transactionBundle);
    const blockNumber = await provider.getBlockNumber();
    const simulation = await flashbotsProvider.simulate(signedBundle, blockNumber);
    if(!simulation.results) {
        console.log(simulation);
        return;
    }

    provider.on("block", async (blockNumber) => {
        console.log(blockNumber);
        const response = await flashbotsProvider.sendBundle(transactionBundle, blockNumber + 1);
        const waitResponse = await response.wait();
        if(waitResponse === 0) {
            console.log("success");
            process.exit();
        }
    });

}

recoverFunds();