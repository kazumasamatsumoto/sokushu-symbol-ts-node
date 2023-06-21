import {
  RepositoryFactoryHttp,
  Account,
  Deadline,
  UInt64,
  AggregateTransaction,
  MosaicId,
  MetadataTransactionService,
  KeyGenerator,
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

  // 各種リポジトリ
  const txRepo = repositoryFactory.createTransactionRepository();
  const metaRepo = repositoryFactory.createMetadataRepository();
  const mosaicRepo = repositoryFactory.createMosaicRepository();
  const nsRepo = repositoryFactory.createNamespaceRepository();

  // メタデータサービス
  const metaService = new MetadataTransactionService(metaRepo);

  // mosaicId
  const mosaicId = new MosaicId("7DF08F144FBC8CC0");
  const mosaicInfo = await mosaicRepo.getMosaic(mosaicId).toPromise();

  const key = KeyGenerator.generateUInt64Key("key_mosaic");
  const value = "test-mosaic";

  const tx = await metaService
    .createMosaicMetadataTransaction(
      undefined,
      networkType,
      mosaicInfo.ownerAddress,
      mosaicId,
      key,
      value,
      alice.address,
      UInt64.fromUint(0)
    )
    .toPromise();

  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment!),
    [tx.toAggregate(alice.publicAccount)],
    networkType,
    []
  ).setMaxFeeForAggregate(100, 0);

  // 署名
  const signedTx = alice.sign(aggregateTx, networkGenerationHash!);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await txRepo.announce(signedTx).toPromise();
  console.log(response);
};
example().then();

// next 5 モザイク
