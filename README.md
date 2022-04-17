# Lamden Batch Factory

Batch Transactions via the Masternode Rest API

## Packages

```bash
npm i
```

## Single Transaction

```javascript
const SendSingleTx = async (txInfo, sk) => {
  const new_transaction = initializeTransactionBuilder();
  new_transaction.addTransactionInfo(txInfo);
  return await sendTransaction(new_transaction, sk);
};

const transaction = {
  sender: someSenderVk,
  contract: contractName,
  method: methodName,
  kwargs: someKwargsObject,
  stamps: stampsLimit,
};
const transaction_hash = await SendSingleTx(transaction, wallet.sk);

if (transaction_hash) {
  const processed_block = await getBlock(transaction_hash);
  console.log(processed_block);
}
```

## Batch Transaction

```javascript
const SendBatchTx = async (batch, sk) => {
  const new_batch = intitializeBatchBuilder();
  new_batch.addTransactionList(batch);
  await sendBatch(new_batch, sk);
};

/*
    transaction = {
        sender: someSenderVk,
        contract: contractName,
        method: methodName,
        kwargs: someKwargsObject,
        stamps: stampsLimit,
    }
*/
const transactions = ArrayOfTransctions;
const transaction_hashs = await SendBatchTx(transactions, wallet.sk);

if (transaction_hashes) {
  for (let transaction_hash in transaction_hashes) {
    const processed_block = await getBlock(
      transaction_hashes[transaction_hash]
    );
    console.log(processed_block);
  }
}
```
