import {
  initializeTransactionBuilder,
  sendTransaction,
  intitializeBatchBuilder,
  sendBatch,
  createTestTransaction,
  createWallet,
  getBlock,
} from "./helpers.mjs";

// throwaway
const test_wallet = {
  vk: "339cd2eead549df059814a41902107f6042e57ea3faf5179abfe36a80a1f70d9",
  sk: "90b96674fa258e130542af6dbce95f9097ccf3ece49eb1fdd6b9054f920d43a5",
};
console.log(test_wallet);

// ########################################################################
// SENDING SINGLE TX
// ########################################################################

const SendSingleTx = async (txInfo, sk) => {
  const new_transaction = initializeTransactionBuilder();
  new_transaction.addTransactionInfo(txInfo);
  return await sendTransaction(new_transaction, sk);
};

const transaction = createTestTransaction(test_wallet.vk);
const transaction_hash = await SendSingleTx(transaction, test_wallet.sk);

if (transaction_hash) {
  const processed_block = await getBlock(transaction_hash);
  console.log(processed_block);
}

// ########################################################################
// SENDING BATCH OF TXS
// ########################################################################

const SendBatchTx = async (batch, sk) => {
  const new_batch = intitializeBatchBuilder();
  new_batch.addTransactionList(batch);
  await sendBatch(new_batch, sk);
};

const transactions = createTestTransaction(test_wallet.vk, 2);
await SendBatchTx(transactions, test_wallet.sk);
