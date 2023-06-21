import {
  Account,
  AggregateTransaction,
  Deadline,
  KeyGenerator,
  MetadataTransactionService,
  PlainMessage,
  RepositoryFactoryHttp,
  TransferTransaction,
  UInt64,
} from "symbol-sdk";

const example = async (): Promise<void> => {
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await repositoryFactory
    .getEpochAdjustment()
    .toPromise();
  const networkType = await repositoryFactory.getNetworkType().toPromise();
  let networkGenerationHash = await repositoryFactory
    .getGenerationHash()
    .toPromise();

  const metaRepo = repositoryFactory.createMetadataRepository();
  const mosaicRepo = repositoryFactory.createMosaicRepository();
  const txRepo = repositoryFactory.createTransactionRepository();
  const metaService = new MetadataTransactionService(metaRepo);
  const AlicePrivateKey =
    "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
  const bobPrivateKey =
    "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14B4DD568DCD";
  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);
  const key = KeyGenerator.generateUInt64Key("key_account");
  const value = "test";
  const tx1 = await metaService
    .createAccountMetadataTransaction(
      undefined,
      networkType!,
      alice.address, //メタデータ記録先アドレス
      key,
      value, //Key-Value値
      alice.address, //メタデータ作成者アドレス,
      UInt64.fromUint(100)
    )
    .toPromise();

  const tx2 = await metaService
    .createAccountMetadataTransaction(
      undefined,
      networkType,
      bob.address, //メタデータ記録先アドレス
      key,
      value, //Key-Value値
      alice.address, //メタデータ作成者アドレス
      UInt64.fromUint(100)
    )
    .toPromise();

  const tx3 = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    alice.address,
    [],
    PlainMessage.create(`hello symbol`),
    networkType
  );
  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [
      tx3.toAggregate(alice.publicAccount),
      tx1.toAggregate(alice.publicAccount),
      tx2.toAggregate(alice.publicAccount),
    ],
    networkType,
    []
  ).setMaxFeeForAggregate(100, 1);

  // @ts-ignore
  const signedTx = aggregateTx.signTransactionWithCosignatories(
    alice,
    [bob],
    networkGenerationHash! // 第二引数に連署者
  );

  await txRepo.announce(signedTx).toPromise();
  const transactionStatusUrl = nodeUrl + "/transactionStatus/" + signedTx.hash;
  console.log("signedTx.payload");
  console.log(signedTx.payload);
  console.log(transactionStatusUrl);
};
example()
  .then()
  .catch((err) => console.log(err));
