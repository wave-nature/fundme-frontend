import { ethers } from "./ethers-v5.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const metamaskBtn = document.querySelector(".metamask-connect");
const fundBtn = document.querySelector(".fund");
const balanceBtn = document.querySelector(".balance");
const withdrawBtn = document.querySelector(".withdraw");

async function connect() {
  if (!!window.ethereum) {
    console.log("Have Metamask");
    await ethereum.request({ method: "eth_requestAccounts" });
    metamaskBtn.textContent = "Connected";
    console.log("Connected!!");
  } else {
    metamaskBtn.textContent = "Please Install Metamask";
  }
}

async function fund() {
  const amount = document.getElementById("ethAmount").value;
  console.log("funding " + amount);
  if (!!window.ethereum) {
    // private key
    // contract (abi,address)

    // provider (rpc metamask)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(); //return connected account from metamask
    //contactAddress - hardhat node fundme contract adrs
    const contract = new ethers.Contract(contractAddress, abi, signer); // ABI ADDRESS

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(amount),
      });
      // listen for the tx to e mined
      // listed for an event

      //wait for tx to finish
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("Please Install Metamask");
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);

  const promise = new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, function (transactionReciept) {
      console.log(
        `Completed with ${transactionReciept.confirmations} confirmations`
      );

      resolve();
    });
  });

  return promise;
}

async function getBalance() {
  try {
    if (!!window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(contractAddress);
      document.querySelector(".balance-text").textContent =
        ethers.utils.formatEther(balance);
    }
  } catch (error) {
    console.log(error);
  }
}

async function withdraw() {
  if (!!window.ethereum) {
    try {
      console.log("Withdrawing...");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);

      getBalance();
    } catch (error) {
      console.log(error);
    }
  }
}

metamaskBtn.addEventListener("click", connect);
fundBtn.addEventListener("click", fund);
balanceBtn.addEventListener("click", getBalance);
withdrawBtn.addEventListener("click", withdraw);
