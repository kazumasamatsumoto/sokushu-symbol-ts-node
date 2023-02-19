import {
  Account,
  Listener,
  MosaicId,
  RepositoryFactoryHttp,
} from "symbol-sdk";
import WebSocket from "ws";

const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
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

  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);

  const nsRepo = repositoryFactory.createNamespaceRepository();
  const wsEndpoint = nodeUrl.replace("http", "ws") + "/ws";
  const listener = new Listener(wsEndpoint, nsRepo, WebSocket);
  listener.open().then(() => {
    listener.confirmed(alice.address).subscribe((tx) => {
      console.log("承認済みトランザクション", tx);
    });

    listener.unconfirmedAdded(alice.address).subscribe((tx) => {
      console.log("未承認トランザクション", tx);
    });
  });
};
example().then();
