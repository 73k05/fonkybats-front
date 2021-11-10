const NFT_CONTRACT_ADDRESS = "0x3E37249bb6dcF9561665Af99aA99599FaFA2a3F5";
const OWNER_ADDRESS = "0x9Ad99955f6938367F4A703c60a957B639D250a95";
const NODE_API_KEY = "pXVRmm1TsgoZMNJGcG0zoiqPQJODSDvd";

const NETWORK = "rinkeby";

const NFT_ABI = [
    {
        constant: false,
        inputs: [
            {
                name: "_to",
                type: "address",
            },
        ],
        name: "mintTo",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
];

const network =
    NETWORK === "mainnet" || NETWORK === "live" ? "mainnet" : "rinkeby";
const web3 = new Web3(Web3.givenProvider, "https://eth-" + network + ".alchemyapi.io/v2/" + NODE_API_KEY);

/**
 * Real NFTs Minting (with gas fees)
 * @param numFonkyBats
 * @returns {Promise<void>}
 */
async function mintNfts(numFonkyBats) {
    let accounts = await web3.eth.requestAccounts();

    const nftContract = new web3.eth.Contract(
        NFT_ABI,
        NFT_CONTRACT_ADDRESS,
        {gasLimit: "1000000"}
    );

    // Creatures issued directly to the owner.
    for (let i = 0; i < numFonkyBats; i++) {
        let result
        try {
            const mintAddress = accounts[0]
            console.log(`Mint nft-s ${i + 1} from [${OWNER_ADDRESS}] to [${mintAddress}]`);
            result = await nftContract.methods
                .mintTo(mintAddress)
                .send({from: OWNER_ADDRESS});
        } catch (error) {
            console.error(`Error while minting...`)
            console.error(error)
            return;
        }
        console.log("Minted Bats successfully. Transaction: " + result.transactionHash);
    }
}