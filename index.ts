import { RepositoryFactoryHttp } from "symbol-sdk";

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
    console.log(epochAdjustment!);
    console.log(networkType!);
    console.log(networkGenerationHash!);
};
example().then();