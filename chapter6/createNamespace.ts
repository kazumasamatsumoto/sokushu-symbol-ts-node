import {
  RepositoryFactoryHttp,
  Account,
  Deadline,
  NamespaceRegistrationTransaction,
} from "symbol-sdk";
const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
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

  const nwRepo = repositoryFactory.createNetworkRepository();
  const txRepo = repositoryFactory.createTransactionRepository();
  const rentalFees = await nwRepo.getRentalFees().toPromise();
  const rootNsperBlock = rentalFees.effectiveRootNamespaceRentalFeePerBlock.compact();
  const rentalDays = 365;
  const rentalBlock = rentalDays * 24 * 60 * 60 / 30;
  const rootNsRentalFeeTotal = rentalBlock * rootNsperBlock;
  console.log("rentalBlock:" + rentalBlock);
  console.log("rootNsRentalFeeTotal", rootNsRentalFeeTotal);

  const childNamespaceRentalFee = rentalFees.effectiveChildNamespaceRentalFee.compact();
  console.log(childNamespaceRentalFee, "childNamespaceRentalFee")

  // トランザクションの作成
  const tx = NamespaceRegistrationTransaction.createSubNamespace(
    Deadline.create(epochAdjustment!),
    "tomato",
    "kazumasa",
    networkType!,
  ).setMaxFee(100)
  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);
  const signedTx = alice.sign(tx, networkGenerationHash!);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await txRepo.announce(signedTx).toPromise();
  console.log(response);
  // const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);

};
example().then();

// next 5 モザイク
