const NFT_CONTRACT_ADDRESS = "0x90B772eB481C86641accfD6d8B98241cA23131dc";
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
            {
                name: "_metadataURI",
                type: "string",
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
            {
                name: "_metadataURI",
                type: "string",
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
            {
                name: "_metadataURI",
                type: "string",
            },
        ],
        name: "adMint",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
];

const NFT_UPDATE_TOKEN_URI_ABI = [
    {
        constant: false,
        inputs: [
            {
                name: "_tokenId",
                type: "uint256",
            },
            {
                name: "_metadataURI",
                type: "string",
            },
        ],
        name: "updateTokenUri",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
];

const NFT_UPDATE_TOKEN_URI_BATCH_ABI = [
    {
        constant: false,
        inputs: [
            {
                name: "_tokenIds",
                type: "uint256[]",
            },
            {
                name: "_metadataURIs",
                type: "string[]",
            },
        ],
        name: "updateTokenUriBatch",
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
                type: "uint256",
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

const GET_TOKEN_URI_ABI = [
    {
        constant: true,
        outputs: [
            {
                name: "",
                type: "string",
            },
        ],
        name: "tokenURI",
        inputs: [
            {
                name: "_tokenId",
                type: "uint256",
            },],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
];

const WITHDRAW_ABI = [
    {
        constant: false,
        inputs: [],
        name: "withdraw",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
];

const CONTRACT_SALE_STATE_INACTIVE = 0;
const CONTRACT_SALE_STATE_PRESALE = 1;
const CONTRACT_SALE_STATE_MAIN_SALE = 2;

const MINTING_PRE_ORDER_PRICE = 0.007
const MINTING_MAIN_SALE_PRICE = 0.009

const network =
    NETWORK === "mainnet" || NETWORK === "live" ? "mainnet" : "rinkeby";
const web3Instance = new Web3(Web3.givenProvider, "https://eth-" + network + ".alchemyapi.io/v2/" + NODE_API_KEY);

//IPFS Protocol prefix
const IPFS_PROTOCOL_PREFIX = "ipfs://";
//Fantom Default Token URI CID
const FANTOM_TOKEN_CID_URI = "QmWziHE4kR4pWXvJTdWB6nXmvHnjE6TspPRLNJsg2WwgJQ";

/**
 * Run after DOM is loaded
 */
window.addEventListener('load', function () {
    initUi();
});

/**
 * Init Wallet Button whether we are on mobile or metmask
 */
function initUi() {
    if (typeof web3 === 'undefined') {
        console.log("Mobile");
        displayElementById("headerConnectDownload");
        displayElementById("headerConnectDownloadLoading");
        hideElementById("walletConnectLoadingButton");
        hideElementById("walletConnectButton");
    }
}

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
    } else {
        displayElementById("nftMintDiv");
    }
    if (contractSaleState == CONTRACT_SALE_STATE_PRESALE) {
        hideElementById("nftSaleMintButton");
        displayElementById("nftPreSaleMintButton");

        hideElementById("nftRangePreSale");
        hideElementById("nftRangePreSale");
        displayElementById("nftRangePreSale");
        displayElementById("nftPricePreSale");
    }
    if (contractSaleState == CONTRACT_SALE_STATE_MAIN_SALE) {
        hideElementById("nftPreSaleMintButton");
        displayElementById("nftSaleMintButton");

        hideElementById("nftRangePreSale");
        hideElementById("nftPricePreSale");
        displayElementById("nftRangeMainSale");
        displayElementById("nftPriceMainSale");
    }

    displayElementById("headerSale");
    hideElementById("headerLoading");
    displayElementById("contractStateDiv");
    //AdMint is always available for the Owner
    displayElementById("nftAdMintDiv");
    //Update Token URI is always available for the Owner
    displayElementById("nftUpdateTokenUriDiv");

    //Scroll Down is always hidden for admin cause UI is too busy
    hideElementById("scrollDownDiv");
    hideElementById("scrollDownDivLoading");
    //We add so many items that we should hide stuff that make the UI clunky
    document.getElementById('headerSale').classList.add("header-hide-after");
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

    //Test Batch
    // await tokenURIUpdates();
}

/**
 * Update Batch URI test fonction
 * @returns {Promise<void>}
 */
async function tokenURIUpdates() {
    //Test for TokenURIs Batch Update
    getTokenUri(1).then((tokenUri) => {
            if (tokenUri == IPFS_PROTOCOL_PREFIX + FANTOM_TOKEN_CID_URI) {
                console.log("Token URI gotten and fantom, update batch");
                updateTokenUriBatch([1, 2, 3], [
                    "QmPjBwCEGvSW4uEsrvMV6ua218THz28YXnnSAAbmcgJAWf",
                    "QmR1rvjtkHdU8Vh9sf4P7wfVX9VvX1LyJSumXSRyqvAgGH",
                    "Qmcw4wQLNrL1NYwYNev6jRoWMc3WyAokqxHkR6r6jqsz4Y"]);
            }
        }
    );
}

/**
 * NFTs PreOrder Minting
 * @param numFonkyBats
 * @returns {Promise<void>}
 */
async function preOrderMintNfts(numFonkyBats) {
    let accounts = await web3Instance.eth.requestAccounts();

    let gasLimit = 1000000 * numFonkyBats;
    const nftContract = new web3Instance.eth.Contract(
        NFT_PRE_ORDER_ABI,
        NFT_CONTRACT_ADDRESS,
        {gasLimit: gasLimit.toString()}
    );

    // FonkyBats issued directly to the minter address
    try {
        const mintAddress = accounts[0]
        const mintPayment = (MINTING_PRE_ORDER_PRICE * numFonkyBats).toString()
        console.log(`Mint ${numFonkyBats} NFTs from [${mintAddress}] to [${mintAddress}] for ${mintPayment}Ξ`);
        result = await nftContract.methods
            .preOrder(mintAddress, numFonkyBats, FANTOM_TOKEN_CID_URI)
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

    let gasLimit = 1000000 * numFonkyBats;
    const nftContract = new web3Instance.eth.Contract(
        NFT_MAIN_SALE_ABI,
        NFT_CONTRACT_ADDRESS,
        {gasLimit: gasLimit.toString()}
    );

    // FonkyBats issued directly to the minter address
    try {
        const mintAddress = accounts[0]
        const mintPayment = (MINTING_MAIN_SALE_PRICE * numFonkyBats).toString()
        console.log(`Mint ${numFonkyBats} NFTs from [${mintAddress}] to [${mintAddress}] for ${mintPayment}Ξ`);
        result = await nftContract.methods
            .mainSaleMint(mintAddress, numFonkyBats, FANTOM_TOKEN_CID_URI)
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
 * @param tokenUri URI of the token to mint, should be an IPFS CID
 * @returns {Promise<void>}
 */
async function adMintNfts(numFonkyBats, addressDestination, tokenUri) {
    if (!addressDestination) {
        addressDestination = OWNER_ADDRESS;
    }
    if (!tokenUri) {
        tokenUri = FANTOM_TOKEN_CID_URI;
    }
    let accounts = await web3Instance.eth.requestAccounts();

    let gasLimit = 1000000 * numFonkyBats;
    const nftContract = new web3Instance.eth.Contract(
        NFT_AD_MINT_ABI,
        NFT_CONTRACT_ADDRESS,
        {gasLimit: gasLimit.toString()}
    );

    // FonkyBats issued directly to the minter address
    try {
        const mintAddress = accounts[0]
        console.log(`AdMint ${numFonkyBats} NFTs from [${mintAddress}] to [${addressDestination}] token URI [${tokenUri}]`);
        result = await nftContract.methods
            .adMint(addressDestination, numFonkyBats, tokenUri)
            .send({from: mintAddress});
    } catch (error) {
        console.error(`Error while minting...`)
        console.error(error)
        return;
    }
    console.log("Minted Bats successfully. Transaction: " + result.transactionHash);
}

/**
 * Update token URI which update meta and ipfs link for reveal 24th December
 * @param nftTokenId Token Id to update
 * @param nftTokenUri Token URI to set, should be a CID like Qmbms6aLmHze2jjf4UJ1rwPnkDyv8E8YiCuGRFP9QT2VZh
 * @returns {Promise<void>}
 */
async function updateTokenUri(nftTokenId, nftTokenUri) {
    if (!nftTokenId || !nftTokenUri) {
        console.error("Please input Token ID and URI")
        return
    }
    let accounts = await web3Instance.eth.requestAccounts();

    const nftContract = new web3Instance.eth.Contract(
        NFT_UPDATE_TOKEN_URI_ABI,
        NFT_CONTRACT_ADDRESS,
        {gasLimit: "1000000"}
    );

    // FonkyBats issued directly to the minter address
    try {
        const mintAddress = accounts[0]
        console.log(`Update Token [${nftTokenId}] to URI [${nftTokenUri}]`);
        result = await nftContract.methods
            .updateTokenUri(nftTokenId, nftTokenUri)
            .send({from: mintAddress});
    } catch (error) {
        console.error(`Error while updating token URI...`)
        console.error(error)
        return;
    }
    console.log("Update successfully. Transaction: " + result.transactionHash);
}

/**
 * Update token URI which update meta and ipfs link for reveal 24th December
 * @param nftTokenIds List of Token Id to update
 * @param nftTokenUris List of Token URI to set, should be a CID like Qmbms6aLmHze2jjf4UJ1rwPnkDyv8E8YiCuGRFP9QT2VZh
 * @returns {Promise<void>}
 */
async function updateTokenUriBatch(nftTokenIds, nftTokenUris) {
    if (!nftTokenIds || !nftTokenUris) {
        console.error("Please input Token IDs and URIs")
        return
    }
    let accounts = await web3Instance.eth.requestAccounts();

    const nftContract = new web3Instance.eth.Contract(
        NFT_UPDATE_TOKEN_URI_BATCH_ABI,
        NFT_CONTRACT_ADDRESS,
        {gasLimit: "1000000"}
    );

    // FonkyBats issued directly to the minter address
    try {
        const userAddress = accounts[0]
        console.log(`Update Token [${nftTokenIds}] to URI [${nftTokenUris}]`);
        result = await nftContract.methods
            .updateTokenUriBatch(nftTokenIds, nftTokenUris)
            .send({from: userAddress});
    } catch (error) {
        console.error(`Error while updating token URIs in Batch...`)
        console.error(error)
        return;
    }
    console.log("Update batch successfully. Transaction: " + result.transactionHash);
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
 * Get Token URI in Smart Contract
 * @returns {Promise<void>}
 */
async function getTokenUri(tokenId) {
    const fonkyContract = new web3Instance.eth.Contract(
        GET_TOKEN_URI_ABI,
        NFT_CONTRACT_ADDRESS,
        {gasLimit: "1000000"}
    );

    const tokenURI = await fonkyContract.methods.tokenURI(tokenId).call();
    console.log(`Token ${tokenId} URI: ${tokenURI}`);
    return tokenURI;
}

/**
 * Contract Withdraw (OnlyOwner)
 * @returns {Promise<void>}
 */
async function withdraw() {
    let accounts = await web3Instance.eth.requestAccounts();

    const nftContract = new web3Instance.eth.Contract(
        WITHDRAW_ABI,
        NFT_CONTRACT_ADDRESS,
        {gasLimit: "1000000"}
    );

    console.log("Withdraw cache out money from contract");

    const mintAddress = accounts[0];
    try {
        result = await nftContract.methods
            .withdraw()
            .send({from: mintAddress});
    } catch (error) {
        console.error(`Error while caching out, maybe you are not the owner...`)
        console.error(error)
        return error;
    }
    console.log("Withdraw successfully. Transaction: " + result.transactionHash);
    return result;
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