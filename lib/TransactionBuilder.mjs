import Lamden from "lamden-js";
import { HTTP_GET_REQUEST, HTTP_POST_REQUEST } from "./utils.mjs";

export class TransactionBuilder {
  constructor(networkInfo, batched = false) {
    this.wallet = Lamden.wallet;
    this.networkInfo = networkInfo;
    this.batched = batched;
    this.transactionInfo = null;
  }
  addTransactionInfo = async (transactionInfo) => {
    this.transactionInfo = await this.createPayload(transactionInfo);
  };
  createPayload = async (transactionInfo) => {
    return {
      payload: this.extractTransactionInfo(transactionInfo),
    };
  };

  addProcessorInfo = async (vk, transaction) => {
    let processorData = {};
    let nonce = null;
    let processor = null;
    if (!this.batched) {
      processorData = await this.getProcessorInfo(vk);
    } else {
      if (this.transactionInfo) {
        nonce = this.transactionInfo.payload.nonce;
        processor = this.transactionInfo.payload.processor;
      }
      processorData = {
        nonce: nonce,
        processor: processor,
      };
    }

    const payloadData = Object.assign({}, transaction, processorData);
    return {
      payload: payloadData,
    };
  };
  getProcessorInfo = async (senderVk) => {
    const host = this.networkInfo.hosts[0];
    const nodeNonceEndpoint = `${host}/nonce/${senderVk}`;
    return await HTTP_GET_REQUEST(nodeNonceEndpoint).then(async (res) => {
      return await res.json();
    });
  };
  extractTransactionInfo = (transactionInfo) => {
    let kwargs = transactionInfo.kwargs;
    if (transactionInfo.kwargs) {
      kwargs = transactionInfo.kwargs;
    }

    return {
      contract: transactionInfo.contract,
      function: transactionInfo.method,
      kwargs: kwargs,
      sender: transactionInfo.vk,
      stamps_supplied: transactionInfo.stamps,
    };
  };

  processTransaction = async (sk) => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await this.sendTransaction(sk);
        resolve(result);
      }, 1000);
    });
  };

  signTransaction = async (sk, payload) => {
    let signature = null;
    const message = await payload;

    if (sk) {
      const stringBuffer = Buffer.from(JSON.stringify(message.payload));
      let messageBytes = new Uint8Array(stringBuffer);
      signature = this.wallet.sign(sk, messageBytes);
    } else {
      console.log("incomplete signature provided -- > use sk to sign payload");
    }
    const timestamp = Math.round(new Date().getTime() / 1000);

    const tx_metadata = {
      metadata: {
        signature: signature,
        timestamp: timestamp,
      },
    };
    const tx_payload = message;
    return Object.assign({}, tx_metadata, tx_payload);
  };
  sendTransaction = async (sk) => {
    const preSignedTransaction = await this.addProcessorInfo(
      this.transactionInfo.payload.sender,
      this.transactionInfo.payload
    );
    const signedTransaction = await this.signTransaction(
      sk,
      preSignedTransaction
    );
    return await HTTP_POST_REQUEST(
      this.networkInfo.hosts[0],
      signedTransaction
    ).then(async (res) => {
      return await res.json();
    });
  };

  addBatchNonce = async (nonceResult) => {
    this.transactionInfo["payload"] = {
      ...this.transactionInfo["payload"],
      nonce: nonceResult.nonce,
      processor: nonceResult.processor,
    };

    if (nonceResult.hosts[0]) {
      this.networkInfo["hosts"] = nonceResult.hosts;
    } else {
      if (this.networkInfo.type == "testnet") {
        this.networkInfo["hosts"] = ["https://testnet-master-1.lamden.io:443"];
      } else {
        this.networkInfo["hosts"] = ["https://masternode-01.lamden.io:443"];
      }
    }
  };
  validateTransactionInfo = (txInfo) => {
    try {
      // "vk", "contract", "method", "kwargs", "stamps"
      txInfo.vk;
      txInfo.contract;
      txInfo.method;
      txInfo.kwargs;
      txInfo.stamps;
      return true;
    } catch (e) {
      return false;
    }
  };

  checkTranscationResult = async (result) => {
    if (result.success) {
      console.log(result.success);
      return result.hash;
    } else {
      console.log(result.error);
    }
  };
}
