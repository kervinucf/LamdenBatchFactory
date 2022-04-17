import Lamden from "lamden-js";
import fetch from "node-fetch";
import { TransactionBatcher } from "./TransactionBatcher.mjs";
import { TransactionBuilder } from "./TransactionBuilder.mjs";

export const createWallet = async (fund = false) => {
  const wallet = Lamden.wallet.new_wallet();
  if (fund) {
    await fund_wallet(wallet.vk);
  }
  return wallet;
};

export const loadWallet = async (sk, fund = false) => {
  const vk = Lamden.wallet.get_vk(sk);
  if (fund) {
    await fund_wallet(vk);
  }
  return {
    vk: vk,
    sk: sk,
  };
};

const fund_wallet = async (vk) => {
  const faucet_url = `https://faucet.lamden.io/.netlify/functions/send?account=${vk}`;
  await HTTP_GET_REQUEST(faucet_url);
};
export const HTTP_POST_REQUEST = async (url, params) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(params),
      });
      console.log(`post request sent -- > ${url}`);

      resolve(response);
    }, 1000);
  });
};

export const HTTP_GET_REQUEST = async (url) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const response = await fetch(url);
      console.log(`get request sent -- > ${url}`);
      resolve(response);
    }, 1000);
  });
};

export const intitializeBatchBuilder = () => {
  return new TransactionBatcher(getNetworkInfo());
};
export const initializeTransactionBuilder = () => {
  return new TransactionBuilder(getNetworkInfo());
};

const getNetworkInfo = (networkType = "testnet") => {
  let type = "testnet";
  let hosts = ["https://testnet-master-1.lamden.io:443"];
  if (networkType == "mainnet") {
    type = "mainnet";
    hosts = ["https://masternode-01.lamden.io:443"];
  }
  return {
    type: type,
    hosts: hosts,
  };
};
export const getBlock = async (hash) => {
  const hashEndpoint = `${getNetworkInfo().hosts[0]}/tx?hash=${hash}`;
  return await HTTP_GET_REQUEST(hashEndpoint).then(async (res) => {
    return await res.json();
  });
};
export const sendTransaction = async (transaction, senderSk) => {
  return await transaction.processTransaction(senderSk).then(async (result) => {
    return await transaction.checkTranscationResult(result);
  });
};
export const sendBatch = async (batch, senderSk) => {
  return await batch.sendAllBatches(senderSk);
};

export const createTestTransaction = (
  sender,
  num = 1,
  contractName = "con_fractal_scratch1",
  methodName = "ping",
  kwargs = {},
  stampLimit = 50
) => {
  if (num > 1) {
    let transactions = [];
    while (transactions.length < num) {
      transactions.push(createTestTransaction(sender));
    }

    return transactions;
  }
  return {
    vk: sender,
    contract: contractName,
    method: methodName,
    kwargs: kwargs,
    stamps: stampLimit,
  };
};

export const SendBatchTx = async (batch, sk) => {
  const new_batch = intitializeBatchBuilder();
  new_batch.addTransactionList(batch);
  return await sendBatch(new_batch, sk);
};

export const SendSingleTx = async (txInfo, sk) => {
  const new_transaction = initializeTransactionBuilder();
  new_transaction.addTransactionInfo(txInfo);
  return await sendTransaction(new_transaction, sk);
};
