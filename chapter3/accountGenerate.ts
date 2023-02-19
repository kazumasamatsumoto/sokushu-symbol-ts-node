import {
  RepositoryFactoryHttp,
  Account,
} from "symbol-sdk";
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
  const alice = Account.generateNewAccount(networkType!)
  console.log(alice);
  console.log(alice.address);
  console.log(alice.privateKey);
  console.log(alice.publicKey);
};
example().then();

// next 4.5 トランザクション履歴
