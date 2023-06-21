import {
  Account,
  AggregateTransaction,
  Deadline,
  KeyGenerator,
  MosaicDefinitionTransaction,
  MosaicFlags,
  MosaicId,
  MosaicNonce,
  MosaicRestrictionTransactionService,
  MosaicRestrictionType,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  RepositoryFactoryHttp,
  UInt64,
} from "symbol-sdk";

const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
const bobPrivateKey =
  "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14B4DD568DCD";
const symbolMosaicId = "72C0212E67A08BCE";

const restrictedAccountsPrivateKey =
  "24A345C541C38289171225EE060A7FAC7E9DF2479DA5FE0BC7C472D0352EB287";

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

  const networkCurrencyMosaicId = new MosaicId(symbolMosaicId);
  const networkCurrencyDivisibility = 6;

  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);
  const restrict = Account.createFromPrivateKey(
    restrictedAccountsPrivateKey,
    networkType!
  );

  const nsRepo = repositoryFactory.createNamespaceRepository();
  const resMosaicRepo = repositoryFactory.createRestrictionMosaicRepository();
  const mosaicResService = new MosaicRestrictionTransactionService(
    resMosaicRepo,
    nsRepo
  );

  const supplyMutable = true;
  const transferable = true;
  const restrictable = true;
  const revokable = true;

  const nonce = MosaicNonce.createRandom();
  const mosaicDefTx = MosaicDefinitionTransaction.create(
    undefined,
    nonce,
    MosaicId.createFromNonce(nonce, alice.address),
    MosaicFlags.create(supplyMutable, transferable, restrictable, revokable),
    0,
    UInt64.fromUint(0),
    networkType!
  );

  const mosaicChangeTx = MosaicSupplyChangeTransaction.create(
    undefined,
    mosaicDefTx.mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(1000000),
    networkType!
  );

  const key = KeyGenerator.generateUInt64Key("KYC");
  const mosaicGlobalResTx = await mosaicResService
    .createMosaicGlobalRestrictionTransaction(
      undefined,
      networkType!,
      mosaicDefTx.mosaicId,
      key,
      "1",
      MosaicRestrictionType.EQ
    )
    .toPromise();

  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment!),
    [
      mosaicDefTx.toAggregate(alice.publicAccount),
      mosaicChangeTx.toAggregate(alice.publicAccount),
      mosaicGlobalResTx.toAggregate(alice.publicAccount),
    ],
    networkType!,
    []
  ).setMaxFeeForAggregate(100, 0);

  const signedTx = alice.sign(aggregateTx, networkGenerationHash!);
  const txRepo = repositoryFactory.createTransactionRepository();
  await txRepo.announce(signedTx).toPromise();
};
example().then();
