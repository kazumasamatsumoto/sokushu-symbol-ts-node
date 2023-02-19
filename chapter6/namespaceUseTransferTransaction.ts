import {
  RepositoryFactoryHttp,
  Account,
  TransferTransaction,
  Deadline,
  EmptyMessage,
  NamespaceId,
} from "symbol-sdk";

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
  const txRepo = repositoryFactory.createTransactionRepository();

  const namespaceId = new NamespaceId("kazumasa");
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);
  // トランザクションの作成
  // const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);
  const tx = TransferTransaction.create(
    Deadline.create(epochAdjustment!),
    namespaceId,
    [],
    EmptyMessage,
    networkType!
  ).setMaxFee(100);

  // 署名
  const signedTx = bob.sign(tx, networkGenerationHash!);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await txRepo.announce(signedTx).toPromise();
  console.log(response);
};
example().then();

// next 5 モザイク
