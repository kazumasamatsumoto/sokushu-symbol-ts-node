import {
  RepositoryFactoryHttp,
  Account,
  Deadline,
  MosaicId,
  NamespaceId,
  AliasTransaction,
  AliasAction,
} from "symbol-sdk";
const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";

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
  const txRepo = repositoryFactory.createTransactionRepository();

  const namespaceId = new NamespaceId("kazumasa.tomato");
  const mosaicId = new MosaicId("7DF08F144FBC8CC0");
  // トランザクションの作成
  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);
  const tx = AliasTransaction.createForMosaic(
    Deadline.create(epochAdjustment!),
    AliasAction.Link,
    namespaceId,
    mosaicId,
    networkType!
  ).setMaxFee(100);
  const signedTx = alice.sign(tx, networkGenerationHash!);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await txRepo.announce(signedTx).toPromise();
  console.log(response);
  // const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);
};
example().then();

// next 5 モザイク
