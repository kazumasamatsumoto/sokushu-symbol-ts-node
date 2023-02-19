import {
  Account,
  AccountRestrictionTransaction,
  AddressRestrictionFlag,
  Deadline,
  MosaicId,
  RepositoryFactoryHttp,
} from "symbol-sdk";

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

  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);
  const restrict = Account.createFromPrivateKey(
    restrictedAccountsPrivateKey,
    networkType!
  );

  const tx =
    AccountRestrictionTransaction.createAddressRestrictionModificationTransaction(
      Deadline.create(epochAdjustment!),
      AddressRestrictionFlag.BlockIncomingAddress,
      [bob.address],
      [],
      networkType!
    ).setMaxFee(100);
  const signedTx = restrict.sign(tx, networkGenerationHash!);
  const txRepo = repositoryFactory.createTransactionRepository();

  await txRepo.announce(signedTx).toPromise();
};
example().then();
