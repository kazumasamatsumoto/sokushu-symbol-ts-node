import {
  Account,
  AggregateTransaction,
  Deadline,
  HashLockTransaction,
  Mosaic,
  MosaicId,
  PlainMessage,
  RepositoryFactoryHttp,
  TransactionService,
  TransferTransaction,
  UInt64,
} from "symbol-sdk";

const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
const bobPrivateKey =
  "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14B4DD568DCD";
const carolPrivateKey =
  "8909D963511C87FB5FDA6D60067D40CF349155F12048AB2A82E1F42BA99D3B8F";
const davitPrivateKey =
  "CE13ADB8CCB0E5A9567525EA1EC86B40E24FB0B273FF924852C1124C308263E8";
const symbolMosaicId = "72C0212E67A08BCE";

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

  const networkCurrencyMosaicId = new MosaicId(symbolMosaicId);
  const networkCurrencyDivisibility = 6;

  const listener = repositoryFactory.createListener();
  const receiptHttp = repositoryFactory.createReceiptRepository();
  const transactionHttp = repositoryFactory.createTransactionRepository();
  const transactionService = new TransactionService(
    transactionHttp,
    receiptHttp
  );
  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);
  const carol = Account.createFromPrivateKey(carolPrivateKey, networkType!);
  const davit = Account.createFromPrivateKey(davitPrivateKey, networkType!);
  const txRepo = repositoryFactory.createTransactionRepository();

  const transferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment!),
    alice.address,
    [
      new Mosaic(
        networkCurrencyMosaicId,
        UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))
      ),
    ],
    PlainMessage.create("sending 10 symbol.xym multisig"),
    networkType!
  );

  const aggregateTransaction = AggregateTransaction.createBonded(
    Deadline.create(epochAdjustment!),
    [transferTransaction.toAggregate(davit.publicAccount)],
    networkType!,
    [],
    UInt64.fromUint(2000000)
  );

  const signedTransaction = bob.sign(
    aggregateTransaction,
    networkGenerationHash!
  );

  console.log(signedTransaction.hash);

  const hashLockTransaction = HashLockTransaction.create(
    Deadline.create(epochAdjustment!),
    new Mosaic(
      networkCurrencyMosaicId,
      UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))
    ),
    UInt64.fromUint(480),
    signedTransaction,
    networkType!,
    UInt64.fromUint(2000000)
  );

  const singedHashLockTransaction = bob.sign(
    hashLockTransaction,
    networkGenerationHash!
  );

  listener.open().then(() => {
    transactionService
      .announceHashLockAggregateBonded(
        singedHashLockTransaction,
        signedTransaction,
        listener
      )
      .subscribe(
        (x) => console.log(x),
        (err) => console.log(err),
        () => listener.close()
      );
  });
};
example().then();
