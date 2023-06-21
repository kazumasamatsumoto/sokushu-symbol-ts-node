import {
  RepositoryFactoryHttp,
  Account,

  Deadline,

  UInt64,

  AggregateTransaction,
  MosaicNonce,
  MosaicDefinitionTransaction,
  MosaicId,
  MosaicFlags,
  MosaicSupplyChangeTransaction,
  MosaicSupplyChangeAction,
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
  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);

  const supplyMutable = true;
  const transferable = false;
  const restrictable = true;
  const revokable = true;

  const nonce = MosaicNonce.createRandom();
  const mosaicDefTx = MosaicDefinitionTransaction.create(
    undefined,
    nonce,
    MosaicId.createFromNonce(nonce, alice.address),
    MosaicFlags.create(supplyMutable, transferable, restrictable, revokable),
    2,
    UInt64.fromUint(0),
    networkType!
  );

  const mosaicChangeTx = MosaicSupplyChangeTransaction.create(
    undefined,
    mosaicDefTx.mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(1000000),
    networkType
  );

  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment!),
    [
      mosaicDefTx.toAggregate(alice.publicAccount),
      mosaicChangeTx.toAggregate(alice.publicAccount),
    ],
    networkType,
    []
  ).setMaxFeeForAggregate(100, 0);



  const txRepo = repositoryFactory.createTransactionRepository();

  const signedTx = alice.sign(aggregateTx, networkGenerationHash!);
  console.log('Payload:', signedTx.payload);
  console.log('Transaction Hash:', signedTx.hash);

  const response = await txRepo
    .announce(signedTx)
    .toPromise();
  console.log(response);
};
example().then();
