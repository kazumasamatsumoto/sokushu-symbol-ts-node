// 注意、これは一度してしまうと使えなくなるので、各自アカウントを用意すること
import {
  RepositoryFactoryHttp,
  Account,
  Deadline,
  UInt64,
  AggregateTransaction,
  MosaicId,
  Mosaic,
  HashLockTransaction,
  MultisigAccountModificationTransaction,
  TransactionService,
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
  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);
  const carol = Account.createFromPrivateKey(carolPrivateKey, networkType!);
  const davit = Account.createFromPrivateKey(davitPrivateKey, networkType!);
  const txRepo = repositoryFactory.createTransactionRepository();

  const multisigTx = MultisigAccountModificationTransaction.create(
    undefined,
    2,
    2,
    [bob.address, carol.address],
    [],
    networkType!
  );

  const aggregateTx = AggregateTransaction.createBonded(
    Deadline.create(epochAdjustment),
    [multisigTx.toAggregate(davit.publicAccount)],
    networkType!,
    []
  ).setMaxFeeForAggregate(100, 3);

  const signedTransaction = davit.sign(aggregateTx, networkGenerationHash!);
  console.log(signedTransaction.hash);

  const networkCurrencyMosaicId = new MosaicId(symbolMosaicId);
  const networkCurrencyDivisibility = 6;

  const hashLockTransaction = HashLockTransaction.create(
    Deadline.create(epochAdjustment!),
    new Mosaic(
      networkCurrencyMosaicId,
      UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))
    ),
    UInt64.fromUint(480),
    signedTransaction,
    networkType,
    UInt64.fromUint(2000000)
  );

  const signedHashLockTransaction = davit.sign(
    hashLockTransaction,
    networkGenerationHash!
  );

  const listener = repositoryFactory.createListener();
  const receiptHttp = repositoryFactory.createReceiptRepository();
  const transactionHttp = repositoryFactory.createTransactionRepository();
  const transactionService = new TransactionService(
    transactionHttp,
    receiptHttp
  );

  listener.open().then(() => {
    transactionService
      .announceHashLockAggregateBonded(
        signedHashLockTransaction,
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
