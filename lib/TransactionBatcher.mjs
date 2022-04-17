import { TransactionBuilder } from "./TransactionBuilder.mjs";
import { HTTP_GET_REQUEST } from "./utils.mjs";

export class TransactionBatcher {
  constructor(networkInfo) {
    this.networkInfo = networkInfo;
    this.txBatches = {};
    this.overflow = [];
    this.nonceResults = {};
    this.running = false;
  }

  addTransactionList(txList) {
    console.log(`adding ${txList.length} txs`);
    txList.forEach((txInfo) => this.addTransaction(txInfo));
  }

  addTransaction(txInfo) {
    if (this.running) {
      this.overflow.push(txInfo);
      return;
    }

    if (this.validateTransactionInfo(txInfo)) {
      if (!this.txBatches[txInfo.vk]) this.txBatches[txInfo.vk] = [];
      this.txBatches[txInfo.vk].push(txInfo);
    }
  }

  validateTransactionInfo(txInfo) {
    return new TransactionBuilder(this.networkInfo).validateTransactionInfo(
      txInfo
    );
  }

  async getStartingNonce(senderVk) {
    const host = this.networkInfo.hosts[0];
    const nodeNonceEndpoint = `${host}/nonce/${senderVk}`;
    return await HTTP_GET_REQUEST(nodeNonceEndpoint).then(async (res) => {
      return await res.json();
    });
  }
  getBatchTransactionBuilder = async () => {
    return new TransactionBuilder(this.networkInfo, true);
  };
  async buildTransactionBatch(nonceResult, txList) {
    return txList
      .map(async (transactionInfo, index) => {
        const new_transaction = await this.getBatchTransactionBuilder();
        await new_transaction.addTransactionInfo(transactionInfo);
        await new_transaction.addBatchNonce({
          nonce: nonceResult.nonce + index,
          processor: nonceResult.processor,
          hosts: [nonceResult.masternode],
        });
        return new_transaction;
      })
      .sort(async (a, b) => {
        let _a = await a;
        let _b = await b;
        a = _a.transactionInfo.payload.nonce;
        b = _b.transactionInfo.payload.nonce;
        a - b;
      });
  }
  sendBatch(txBatch, senderSk) {
    let resolvedTransactions = [];
    return new Promise((resolver) => {
      const resolve = (index) => {
        if (index + 1 === txBatch.length) resolver(resolvedTransactions);
      };

      txBatch.forEach((batchedTransaction, index) => {
        const delayedSend = async () => {
          resolvedTransactions[index] = await batchedTransaction.then(
            async (transaction) => {
              console.log(`processing tx#${index + 1}`);
              const processed_transaction = await transaction
                .processTransaction(senderSk)
                .then(async (result) => {
                  console.log(`tx#${index + 1} processed --> ${result.hash}`);
                  return await transaction.checkTranscationResult(result);
                });

              return processed_transaction;
            }
          );
          resolve(index);
        };
        setTimeout(delayedSend, 1200 * index);
      });
    });
  }
  async sendAllBatches(sk) {
    if (this.running) return;
    let sentTransactions = [];
    this.running = true;

    await Promise.all(
      Object.keys(this.txBatches).map((senderVk) => {
        const senderBatch = this.txBatches[senderVk];
        // to-do const senderBatch = this.txBatches[senderVk].slice(0, 15);
        //if (senderBatch.length <= 15) delete this.txBatches[senderVk];

        return new Promise(async (resolver) => {
          if (senderBatch.length === 0) resolver();

          if (!sk)
            throw new Error(
              `Cannot sign batch for ${senderVk}. No signing key provided.`
            );
          const nonceResponse = await this.getStartingNonce(senderVk);
          const txBatch = await this.buildTransactionBatch(
            nonceResponse,
            senderBatch
          );

          this.sendBatch(txBatch, sk).then((sentList) => {
            sentTransactions = [...sentTransactions, ...sentList];
            resolver();
          });
        });
      })
    );
    return sentTransactions;
  }
  processOverflow() {
    const overflow = this.overflow;
    this.overflow = [];
    overflow.forEach((txInfo) => this.addTransaction(txInfo));
  }

  hasTransactions() {
    let test = Object.keys(this.txBatches).map(
      (senderVk) => this.txBatches[senderVk].length
    );
    test.filter((f) => f === 0);
    if (test.length > 0) return true;
    return false;
  }
}
