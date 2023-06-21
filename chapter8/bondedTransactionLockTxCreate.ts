import {
  RepositoryFactoryHttp,
  Account,
  TransferTransaction,
  Deadline,
  PlainMessage,
  UInt64,
  AggregateTransaction,
  Mosaic,
  EmptyMessage,
  NamespaceId,
  MetadataTransactionService,
  HashLockTransaction,
} from "symbol-sdk";
const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
const bobPrivateKey =
  "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14B4DD568DCD";

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await repositoryFactory
    .getEpochAdjustment()
    .toPromise();
  const networkType = await repositoryFactory.getNetworkType().toPromise();
  const networkGenerationHash = await repositoryFactory
    .getGenerationHash()
    .toPromise();
  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);

  // アグリゲートボンデットトランザクションの作成
  // ２つのトランザクション
  const tx1 = TransferTransaction.create(
    undefined,
    bob.address, //Bobへの送信
    [
      //1XYM
      new Mosaic(new NamespaceId("symbol.xym"), UInt64.fromUint(1000000)),
    ],
    EmptyMessage, //メッセージ無し
    networkType
  );

  const tx2 = TransferTransaction.create(
    undefined,
    alice.address, // Aliceへの送信
    [],
    PlainMessage.create("thank you!"), //メッセージ
    networkType
  );

  const aggregateArray = [
    tx1.toAggregate(alice.publicAccount), //Aliceからの送信
    tx2.toAggregate(bob.publicAccount), // Bobからの送信
  ];

  //アグリゲートボンデッドトランザクション
  const aggregateTx = AggregateTransaction.createBonded(
    Deadline.create(epochAdjustment),
    aggregateArray,
    networkType,
    []
  ).setMaxFeeForAggregate(100, 1);

  //署名
  const signedAggregateTx = alice.sign(aggregateTx, networkGenerationHash!);

  // ハッシュロックTXを作成
  const hashLockTx = HashLockTransaction.create(
    Deadline.create(epochAdjustment!),
    new Mosaic(new NamespaceId("symbol.xym"), UInt64.fromUint(10 * 1000000)),
    UInt64.fromUint(480),
    signedAggregateTx,
    networkType!
  ).setMaxFee(100);

  const signedLockTx = alice.sign(hashLockTx, networkGenerationHash!);

  console.log(
    signedAggregateTx.hash,
    "アグリゲートトランザクションのハッシュ値"
  );
  console.log(signedLockTx.hash, "ロックトランザクションのハッシュ値");
  const txRepo = repositoryFactory.createTransactionRepository();

  const lockResponse = await txRepo.announce(signedLockTx).toPromise();
  const txResponse = await txRepo
    .announceAggregateBonded(signedAggregateTx)
    .toPromise();
  console.log(lockResponse);
  console.log(txResponse);

  const metaRepo = repositoryFactory.createMetadataRepository();
  const mosaicRepo = repositoryFactory.createMosaicRepository();
  const nsRepo = repositoryFactory.createNamespaceRepository();
  // メタデータサービス
  const metaService = new MetadataTransactionService(metaRepo);
};
example().then();
