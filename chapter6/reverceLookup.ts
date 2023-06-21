import {
  RepositoryFactoryHttp,
  Account,
  MosaicId,
  NamespaceId,
} from "symbol-sdk";
const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
const bobPrivateKey =
  "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14B4DD568DCD";

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
  const txRepo = repositoryFactory.createTransactionRepository();

  const namespaceId = new NamespaceId("kazumasa");
  const namespaceIdMosaic = new NamespaceId("kazumasa.tomato");
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);
  // トランザクションの作成
  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);

  const nsRepo = repositoryFactory.createNamespaceRepository();
  const accountNames = await nsRepo
    .getAccountsNames([alice.address])
    .toPromise();

  const namespaceIds = accountNames[0].names.map((name) => {
    return name.namespaceId;
  });
  console.log(namespaceIds);

  const mosaicNames = await nsRepo
    .getMosaicsNames([new MosaicId("7DF08F144FBC8CC0")])
    .toPromise();

  const mosaicNamespaceIds = mosaicNames[0].names.map((name) => {
    return name.namespaceId;
  });
  console.log(mosaicNamespaceIds);
};
example().then();

// next 5 モザイク
