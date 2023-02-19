import {
  RepositoryFactoryHttp,
  Account,
  Deadline,
  UInt64,
  AggregateTransaction,
  MetadataTransactionService,
  KeyGenerator,
} from "symbol-sdk";
const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
const bobPrivateKey =
  "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14B4DD568DCD";

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
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);
  // トランザクションの作成
  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);
  const metaRepo = repositoryFactory.createMetadataRepository();
  const mosaicRepo = repositoryFactory.createMosaicRepository();
  const metaService = new MetadataTransactionService(metaRepo);

  const key = KeyGenerator.generateUInt64Key("key_account");
  const value = "test-alice";

  const tx = await metaService.createAccountMetadataTransaction(
    undefined,
    networkType!,
    alice.address,
    key,value,
    alice.address,
    UInt64.fromUint(0)
  ).toPromise();

  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment!),
    [tx.toAggregate(alice.publicAccount)],
    networkType,[]
  ).setMaxFeeForAggregate(100, 0)
  const txRepo = repositoryFactory.createTransactionRepository();

  // 署名
  const signedTx = alice.sign(aggregateTx, networkGenerationHash!);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await txRepo.announce(signedTx).toPromise();
  console.log(response);
};
example().then();

// next 5 モザイク
