import {
  RepositoryFactoryHttp,
  Account,
  Address,
  TransferTransaction,
  Deadline,
  PlainMessage,
  UInt64,
} from "symbol-sdk";
const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
const bobAddress = "TBH3OVV3AFONJZSYOMUILGERPNYY77AISF54C4Q";

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
  const recipientAddress = Address.createFromRawAddress(bobAddress);
  const transferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment!), // 有効期限
    recipientAddress, // 受取人のアドレス
    [], // 送信するモザイクとその数量
    PlainMessage.create("This is a test message"), // メッセージ
    networkType!, // ネットワークタイプ
    UInt64.fromUint(2000000) // 手数料
  );

  const account = Account.createFromPrivateKey(AlicePrivateKey, networkType!);
  const signedTransaction = account.sign(
    transferTransaction,
    networkGenerationHash!
  );
  console.log(signedTransaction.hash, "hash");
  console.log(signedTransaction.payload, "payload");
  const transactionRepository = repositoryFactory.createTransactionRepository();
  const response = await transactionRepository
    .announce(signedTransaction)
    .toPromise();
  console.log(response);
};
example().then();
