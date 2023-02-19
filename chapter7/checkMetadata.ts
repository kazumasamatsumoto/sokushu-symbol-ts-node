import {
  RepositoryFactoryHttp,
  Account,
} from "symbol-sdk";
const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
const bobPrivateKey =
  "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14B4DD568DCD";
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

  // 各種リポジトリ
  const metaRepo = repositoryFactory.createMetadataRepository();

  const res = await metaRepo
    .search({
      targetAddress: alice.address,
      sourceAddress: alice.address,
    })
    .toPromise();
  console.log(JSON.stringify(res, null, "\t"));
};
example().then();
