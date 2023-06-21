import {
  RepositoryFactoryHttp,
  Account,
  Deadline,
  NamespaceRegistrationTransaction,
  UInt64,
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

  const nwRepo = repositoryFactory.createNetworkRepository();
  const txRepo = repositoryFactory.createTransactionRepository();
  const rentalFees = await nwRepo.getRentalFees().toPromise();
  const rootNsperBlock =
    rentalFees.effectiveRootNamespaceRentalFeePerBlock.compact();
  const rentalDays = 365;
  const rentalBlock = (rentalDays * 24 * 60 * 60) / 30;
  const rootNsRenatalFeeTotal = rentalBlock * rootNsperBlock;
  console.log("rentalBlock:" + rentalBlock);
  console.log("rootNsRenatalFeeTotal:" + rootNsRenatalFeeTotal);
  const namespaceName = "matsumoto"

  // トランザクションの作成
  const tx = NamespaceRegistrationTransaction.createRootNamespace(
    Deadline.create(epochAdjustment!),
    namespaceName,
    UInt64.fromUint(172800),
    networkType!
  ).setMaxFee(2000);
  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);
  const signedTx = alice.sign(tx, networkGenerationHash!);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await txRepo.announce(signedTx).toPromise();
  console.log(response);
};
example().then();
