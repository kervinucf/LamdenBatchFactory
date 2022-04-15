import fetch from "node-fetch";
import Lamden from "lamden-js";

const HTTP_POST_REQUEST = async (url, params) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(params),
      });

      resolve(response);
    }, 1000);
  });
};

const HTTP_GET_REQUEST = async (url) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const response = await fetch(url);
      console.log(`get request sent -- > ${url}`);
      resolve(response);
    }, 1000);
  });
};

export class TransactionBuilder {
  constructor(networkInfo, batched = false) {
    this.wallet = Lamden.wallet;
    this.networkInfo = networkInfo;
    this.batched = batched;
    this.transaction = null;
  }
  addTransactionInfo = async (transactionInfo) => {
    this.transaction = await this.createPayload(transactionInfo);
  };
  createPayload = async (transactionInfo) => {
    const transactionData = this.extractTransactionInfo(transactionInfo);
    let processorData = {};
    let nonce = null;
    let processor = null;
    if (!this.batched) {
      processorData = await this.getProcessorInfo(transactionData.sender);
    } else {
      if (this.transaction) {
        nonce = this.transaction.nonce;
        processor = this.transaction.processor;
      }
      processorData = {
        nonce: nonce,
        processor: processor,
      };
    }
    const payloadData = Object.assign({}, transactionData, processorData);
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
        const transaction = await this.signTransaction(sk, this.transaction);

        const result = await this.sendTransaction(transaction);
        resolve(result);
      }, 1000);
    });
  };
  signTransaction = async (sk, payload) => {
    let signature = null;
    const message = await payload;
    console.log(payload);
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
  sendTransaction = async (transactionData) => {
    return await HTTP_POST_REQUEST(
      this.networkInfo.hosts[0],
      transactionData
    ).then(async (res) => {
      return await res.json();
    });
  };

  addBatchNonce = async (nonceResult) => {
    this.transaction["payload"]["nonce"] = nonceResult.nonce;
    this.transaction["payload"]["processor"] = nonceResult.processor;
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
  validateTransactionInfo = () => {};

  checkTranscationResult = async (result) => {
    if (result.success) {
      console.log(result.success);
      return result.hash;
    } else {
      console.log(result.error);
    }
  };
}
