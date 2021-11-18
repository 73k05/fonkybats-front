const NFT_CONTRACT_ADDRESS = "0x26cE9980534d7EdA0d7acA50c262EDd4104f0768";
const OWNER_ADDRESS = "0x9Ad99955f6938367F4A703c60a957B639D250a95";
const NODE_API_KEY = "pXVRmm1TsgoZMNJGcG0zoiqPQJODSDvd";

const NETWORK = "rinkeby";

const NFT_MAIN_SALE_ABI = [
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
        name: "mainSaleMint",
        outputs: [],
        payable: true,
        stateMutability: "payable",
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

const NFT_AD_MINT_ABI = [
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
        name: "adMint",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
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

const CONTRACT_SALE_STATE_INACTIVE = 0;
const CONTRACT_SALE_STATE_PRESALE = 1;
const CONTRACT_SALE_STATE_MAIN_SALE = 2;

const MINTING_PRE_ORDER_PRICE=0.001
const MINTING_MAIN_SALE_PRICE=0.001

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
    return getSaleState().then(contractSaleState => {
        console.log(`State gotten ${contractSaleState}`)
        if (contractSaleState === undefined || contractSaleState == CONTRACT_SALE_STATE_INACTIVE) {
            return contractSaleState;
        }
        if (contractSaleState == CONTRACT_SALE_STATE_PRESALE) {
            displayElementById("nftPreSaleMintButton");
        }
        if (contractSaleState == CONTRACT_SALE_STATE_MAIN_SALE) {
            displayElementById("nftSaleMintButton");
        }

        displayElementById("nftMintDiv");
        displayElementById("headerSale");
        hideElementById("headerLoading");
        return contractSaleState;
    });
}

/**
 * Init Some UI for Owner Only
 * @param mintAddress should be the owner of the contract otherwise this function does nothing
 * @param contractSaleState current sale state of the contract
 */
function initAdminUi(mintAddress, contractSaleState) {
    if (mintAddress !== OWNER_ADDRESS) {
        console.log(`mintAddress: ${mintAddress}`);
        return;
    }

    //Sale minting UI
    if (contractSaleState === undefined || contractSaleState == CONTRACT_SALE_STATE_INACTIVE) {
        hideElementById("nftMintDiv");
    }
    else{
        displayElementById("nftMintDiv");
    }
    if (contractSaleState == CONTRACT_SALE_STATE_PRESALE) {
        hideElementById("nftSaleMintButton");
        displayElementById("nftPreSaleMintButton");
    }
    if (contractSaleState == CONTRACT_SALE_STATE_MAIN_SALE) {
        hideElementById("nftPreSaleMintButton");
        displayElementById("nftSaleMintButton");
    }

    displayElementById("headerSale");
    hideElementById("headerLoading");
    displayElementById("contractStateDiv");
    //AdMint is always available for the Owner
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

    const mintAddress = accounts[0];
    try {
        result = await nftContract.methods
            .setSaleState(state)
            .send({from: mintAddress});
    } catch (error) {
        console.error(`Error while setting state, maybe you are not the owner...`)
        console.error(error)
        return error;
    }
    console.log("State set successfully. Transaction: " + result.transactionHash);
    initAdminUi(mintAddress, state)
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
    const contractSaleState = await initSaleState();
    initAdminUi(mintAddress, contractSaleState);
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
        const mintPayment = (MINTING_PRE_ORDER_PRICE * numFonkyBats).toString()
        console.log(`Mint ${numFonkyBats} NFTs from [${mintAddress}] to [${mintAddress}] for ${mintPayment}Ξ`);
        result = await nftContract.methods
            .preOrder(mintAddress, numFonkyBats)
            .send({from: mintAddress, value: web3Instance.utils.toWei(mintPayment, "ether")});
    } catch (error) {
        console.error(`Error while minting...`)
        console.error(error)
        return;
    }
    console.log("Minted Bats successfully. Transaction: " + result.transactionHash);
}

/**
 * NFTs Main Sale Minting
 * @param numFonkyBats
 * @returns {Promise<void>}
 */
async function mainSaleMintNfts(numFonkyBats) {
    let accounts = await web3Instance.eth.requestAccounts();

    const nftContract = new web3Instance.eth.Contract(
        NFT_MAIN_SALE_ABI,
        NFT_CONTRACT_ADDRESS,
        {gasLimit: "1000000"}
    );

    // FonkyBats issued directly to the minter address
    try {
        const mintAddress = accounts[0]
        const mintPayment = (MINTING_MAIN_SALE_PRICE * numFonkyBats).toString()
        console.log(`Mint ${numFonkyBats} NFTs from [${mintAddress}] to [${mintAddress}] for ${mintPayment}Ξ`);
        result = await nftContract.methods
            .mainSaleMint(mintAddress, numFonkyBats)
            .send({from: mintAddress, value: web3Instance.utils.toWei(mintPayment, "ether")});
    } catch (error) {
        console.error(`Error while minting...`)
        console.error(error)
        return;
    }
    console.log("Minted Bats successfully. Transaction: " + result.transactionHash);
}

/**
 * Real NFTs Minting (with gas fees) Only For Owner of the contract, should be used before presale
 * @param numFonkyBats number of NFTs to Mint
 * @param addressDestination the address where to send those NTFs after these have been minted
 * @returns {Promise<void>}
 */
async function adMintNfts(numFonkyBats, addressDestination) {
    if(!addressDestination){
        console.error("Please input destination address")
        return
    }
    let accounts = await web3Instance.eth.requestAccounts();

    const nftContract = new web3Instance.eth.Contract(
        NFT_AD_MINT_ABI,
        NFT_CONTRACT_ADDRESS,
        {gasLimit: "1000000"}
    );

    // FonkyBats issued directly to the minter address
    try {
        const mintAddress = accounts[0]
        console.log(`AdMint ${numFonkyBats} NFTs from [${mintAddress}] to [${addressDestination}]`);
        result = await nftContract.methods
            .adMint(addressDestination, numFonkyBats)
            .send({from: mintAddress});
    } catch (error) {
        console.error(`Error while minting...`)
        console.error(error)
        return;
    }
    console.log("Minted Bats successfully. Transaction: " + result.transactionHash);
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