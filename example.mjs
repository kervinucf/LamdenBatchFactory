import {
  SendSingleTx,
  SendBatchTx,
  createTestTransaction,
  getBlock,
} from "./lib/utils.mjs";

// throwaway
const test_wallet = {
  vk: "339cd2eead549df059814a41902107f6042e57ea3faf5179abfe36a80a1f70d9",
  sk: "90b96674fa258e130542af6dbce95f9097ccf3ece49eb1fdd6b9054f920d43a5",
};

// ########################################################################
// SENDING SINGLE TX
// ########################################################################

const transaction = createTestTransaction(test_wallet.vk);
const transaction_hash = await SendSingleTx(transaction, test_wallet.sk);

if (transaction_hash) {
  const processed_block = await getBlock(transaction_hash);
  console.log(processed_block);
}
// ########################################################################
// SENDING BATCH OF TXS
// ########################################################################

const transactions = createTestTransaction(test_wallet.vk, 3);
const transaction_hashes = await SendBatchTx(transactions, test_wallet.sk);

console.log(transaction_hashes);

for (let transaction_hash in transaction_hashes) {
  if (transaction_hashes[transaction_hash]) {
    const processed_block = await getBlock(
      transaction_hashes[transaction_hash]
    );
    console.log(processed_block);
  }
}
