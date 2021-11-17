const NFT_CONTRACT_ADDRESS = "0xDd92F009FBdC3AE62f855Bc7de336B2412595995";
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

const NFT_PRE_ORDER_ABI = [
    {
        constant: false,
        inputs: [
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_numberOfTokens",
                type: "uint256",
            },
        ],
        name: "preOrder",
        outputs: [],
        payable: true,
        stateMutability: "payable",
        type: "function",
    },
];

const SET_SALE_STATE_ABI = [
    {
        constant: false,
        inputs: [
            {
                name: "_state",
                type: "uint8",
            },
        ],
        name: "setSaleState",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
];

const GET_SALE_STATE_ABI = [
    {
        constant: true,
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        name: "saleState",
        inputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
];

const CONTRACT_SALE_STATE_PRESALE = 1;
const CONTRACT_SALE_STATE_MAINSALE = 2;

const network =
    NETWORK === "mainnet" || NETWORK === "live" ? "mainnet" : "rinkeby";
const web3Instance = new Web3(Web3.givenProvider, "https://eth-" + network + ".alchemyapi.io/v2/" + NODE_API_KEY);

/**
 * Init Document like displaying wallet address
 */
$(document).ready(function () {
});

/**
 * Init sale state in UIX
 */
function initSaleState() {
    getSaleState().then(contractSaleState => {
        console.log(`State gotten ${contractSaleState}`)
        if (contractSaleState == CONTRACT_SALE_STATE_PRESALE) {
            displayElementById("nftPreSaleMintButton");
        }
        if (contractSaleState == CONTRACT_SALE_STATE_MAINSALE) {
            displayElementById("nftSaleMintButton");
        }
    });
}

/**
 * Init Some UI for Owner Only
 * @param mintAddress should be the owner of the contract otherwise this function does nothing
 */
function initAdminUi(mintAddress) {
    if (mintAddress !== OWNER_ADDRESS) {
        console.log(`mintAddress: ${mintAddress}`);
        return;
    }

    displayElementById("nftMintDiv");
    displayElementById("headerSale");
    hideElementById("headerLoading");
    displayElementById("contractStateDiv");
    displayElementById("nftAdMintDiv");
}

/**
 * Set SaleState
 * @param state of type enum SaleState {Inactive, PreOrder, Sale}
 * @returns {Promise<void>}
 */
async function setState(state) {
    let accounts = await web3Instance.eth.requestAccounts();

    const nftContract = new web3Instance.eth.Contract(
        SET_SALE_STATE_ABI,
        NFT_CONTRACT_ADDRESS,
        {gasLimit: "1000000"}
    );

    console.log(`Change state of Sale to ${state}`);

    try {
        result = await nftContract.methods
            .setSaleState(state)
            .send({from: accounts[0]});
    } catch (error) {
        console.error(`Error while setting state, maybe you are not the owner...`)
        console.error(error)
        return;
    }
    console.log("State set successfully. Transaction: " + result.transactionHash);
    return result;
}

async function setStateInactive() {
    setState(0).then(r => console.log(`Sate saved ${r}`));
}

async function setStatePreOrder() {
    setState(1).then(r => console.log(`Sate saved ${r}`));
}

async function setStateMainSale() {
    setState(2).then(r => console.log(`Sate saved ${r}`));
}

/**
 * Connect Metamask Wallet
 * @returns {Promise<void>}
 */
async function connectWallet() {
    let accounts = await web3Instance.eth.requestAccounts();
    const mintAddress = accounts[0];

    if (mintAddress === undefined || mintAddress === null) {
        console.error(`Wallet address error ${mintAddress}`);
        return;
    }

    // Set & display wallet infos
    getElementById("walletAddressSpan").innerText = mintAddress.substr(0, 6).concat("...").concat(mintAddress.substr(mintAddress.length - 5, mintAddress.length - 1));
    getElementById("walletAddressLoadingSpan").innerText = mintAddress.substr(0, 6).concat("...").concat(mintAddress.substr(mintAddress.length - 5, mintAddress.length - 1));
    displayElementById("walletAddressLabel");
    displayElementById("walletAddressLoadingLabel");
    //Hide connect button
    hideElementById("walletConnectButton");
    hideElementById("walletConnectLoadingButton");

    //Init sale state
    initSaleState();
    initAdminUi(mintAddress);
}

/**
 * NFTs PreOrder Minting
 * @param numFonkyBats
 * @returns {Promise<void>}
 */
async function preOrderMintNfts(numFonkyBats) {
    let accounts = await web3Instance.eth.requestAccounts();

    const nftContract = new web3Instance.eth.Contract(
        NFT_PRE_ORDER_ABI,
        NFT_CONTRACT_ADDRESS,
        {gasLimit: "1000000"}
    );

    // FonkyBats issued directly to the minter address
    try {
        const mintAddress = accounts[0]
        console.log(`Mint ${numFonkyBats} NFTs from [${mintAddress}] to [${mintAddress}]`);
        result = await nftContract.methods
            .preOrder(mintAddress, numFonkyBats)
            .send({from: mintAddress, value: web3Instance.utils.toWei("0.01", "ether")});
    } catch (error) {
        console.error(`Error while minting...`)
        console.error(error)
        return;
    }
    console.log("Minted Bats successfully. Transaction: " + result.transactionHash);
}

/**
 * Real NFTs Minting (with gas fees)
 * @param numFonkyBats
 * @returns {Promise<void>}
 */
async function mintNfts(numFonkyBats) {
    let accounts = await web3Instance.eth.requestAccounts();

    const nftContract = new web3Instance.eth.Contract(
        NFT_ABI,
        NFT_CONTRACT_ADDRESS,
        {gasLimit: "1000000"}
    );

    // FonkyBats issued directly to the owner. Calling mintTo which is only visible to owner
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

/**
 * Real NFTs Minting (with gas fees) Only For Owner of the contract, should be used before presale
 * @param numFonkyBats number of NFTs to Mint
 * @param addressDestination the address where to send those NTFs after these have been minted
 * @returns {Promise<void>}
 */
async function adMintNfts(numFonkyBats, addressDestination) {

}

/**
 * Set Sale State in Smart Contract
 * @returns {Promise<void>}
 */
async function getSaleState() {
    const fonkyContract = new web3Instance.eth.Contract(
        GET_SALE_STATE_ABI,
        NFT_CONTRACT_ADDRESS,
        {gasLimit: "1000000"}
    );

    const saleState = await fonkyContract.methods.saleState.call().call();
    console.log(`Sale State in contract: ${saleState}`);
    return saleState;
}


/**
 * Get element in HTML by id
 * @param id of the element
 * @returns {HTMLElement}
 */
function getElementById(id) {
    return document.getElementById(id);
}

/**
 * Display Element by id, remove class "hide"
 * @param id of the element to display
 */
function displayElementById(id) {
    getElementById(id).classList.remove("hide");
}

/**
 * Hide Element by id, add class "hide"
 * @param id of the element to hide
 */
function hideElementById(id) {
    getElementById(id).classList.add("hide");
}