import {
  RepositoryFactoryHttp,
  Account,
  TransferTransaction,
  Deadline,
  UInt64,
  MosaicId,
  Mosaic,
  EmptyMessage,
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

  const tx = TransferTransaction.create(
    Deadline.create(epochAdjustment!),
    bob.address,
    [
      new Mosaic(new MosaicId("72C0212E67A08BCE"), UInt64.fromUint(10000000)),
      new Mosaic(new MosaicId("7DF08F144FBC8CC0"), UInt64.fromUint(1000)),
    ],
    EmptyMessage,
    networkType
  ).setMaxFee(100);

  const txRepo = repositoryFactory.createTransactionRepository();

  const signedTx = alice.sign(tx, networkGenerationHash!);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await txRepo.announce(signedTx).toPromise();
  console.log(response);
};
example().then();
