import {
  Account,
  Deadline,
  KeyGenerator,
  MosaicAddressRestrictionTransaction,
  MosaicId,
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

  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);
  const restrict = Account.createFromPrivateKey(
    restrictedAccountsPrivateKey,
    networkType!
  );

  const mosaicId = new MosaicId("36690409EC152439");
  const aliceMosaicAddressResTx = MosaicAddressRestrictionTransaction.create(
    Deadline.create(epochAdjustment!),
    mosaicId,
    KeyGenerator.generateUInt64Key("KYC"),
    alice.address,
    UInt64.fromUint(1),
    networkType!,
    UInt64.fromHex("FFFFFFFFFFFFFFFF")
  ).setMaxFee(100);

  const signedTx = alice.sign(aliceMosaicAddressResTx, networkGenerationHash!);
  const txRepo = repositoryFactory.createTransactionRepository();
  await txRepo.announce(signedTx).toPromise();

  const bobMosaicAddressResTx = MosaicAddressRestrictionTransaction.create(
    Deadline.create(epochAdjustment!),
    mosaicId,
    KeyGenerator.generateUInt64Key("KYC"),
    bob.address,
    UInt64.fromUint(1),
    networkType!,
    UInt64.fromHex("FFFFFFFFFFFFFFFF")
  ).setMaxFee(100);
  const bobSignedTx = alice.sign(bobMosaicAddressResTx, networkGenerationHash!);
  await txRepo.announce(bobSignedTx).toPromise();
};
example().then();
