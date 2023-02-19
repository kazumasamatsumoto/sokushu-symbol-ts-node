import {
  RepositoryFactoryHttp,
  Account,
  PublicAccount,
  TransferTransaction,
  Deadline,
  PlainMessage,
  UInt64,
  AggregateTransaction,
} from "symbol-sdk";
const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
const AlicePublicKey =
  "C57096FF4507B39B79F49EB486EBD5E1673B2448974C64231A23CB5BB6E78540";
const bobPrivateKey =
  "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14B4DD568DCD";
const carolPrivateKey =
  "8909D963511C87FB5FDA6D60067D40CF349155F12048AB2A82E1F42BA99D3B8F";

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-04.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await repositoryFactory
    .getEpochAdjustment()
    .toPromise();
  const networkType = await repositoryFactory.getNetworkType().toPromise();
  const networkGenerationHash = await repositoryFactory
    .getGenerationHash()
    .toPromise();
  const alicePublicAccount = PublicAccount.createFromPublicKey(
    AlicePublicKey,
    networkType!
  );
  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);
  const carol = Account.createFromPrivateKey(carolPrivateKey, networkType!);

  const innerTx1 = TransferTransaction.create(
    undefined,
    bob.address,
    [],
    PlainMessage.create("tx1"),
    networkType
  );

  const innerTx2 = TransferTransaction.create(
    undefined,
    carol.address,
    [],
    PlainMessage.create("tx2"),
    networkType
  );

  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment!),
    [
      innerTx1.toAggregate(alicePublicAccount),
      innerTx2.toAggregate(alicePublicAccount),
    ],
    networkType,
    [],
    UInt64.fromUint(1000000)
  );
  const txRepo = repositoryFactory.createTransactionRepository();

  const signedTx = alice.sign(aggregateTx, networkGenerationHash!);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await txRepo.announce(signedTx).toPromise();
  console.log(response);
};
example().then();

// next 4.5 トランザクション履歴
