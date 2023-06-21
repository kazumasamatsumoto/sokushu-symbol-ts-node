import { Account, Listener, MosaicId, RepositoryFactoryHttp } from "symbol-sdk";
import WebSocket from "ws";

const bobPrivateKey =
  "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14B4DD568DCD";
const carolPrivateKey =
  "8909D963511C87FB5FDA6D60067D40CF349155F12048AB2A82E1F42BA99D3B8F";
const symbolMosaicId = "72C0212E67A08BCE";

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

  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);
  const carol = Account.createFromPrivateKey(carolPrivateKey, networkType!);

  const nsRepo = repositoryFactory.createNamespaceRepository();
  const wsEndpoint = nodeUrl.replace("http", "ws") + "/ws";
  const listener = new Listener(wsEndpoint, nsRepo, WebSocket);
  listener.open().then(() => {
    listener
      .aggregateBondedAdded(bob.address)
      .subscribe(async (tx) => console.log("こいつ動くぞ", tx));

    listener
      .aggregateBondedAdded(carol.address)
      .subscribe(async (tx) => console.log("こいつも動くんかな？", tx));
  });
};
example().then();
