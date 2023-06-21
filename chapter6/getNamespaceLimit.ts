import { RepositoryFactoryHttp, NamespaceId } from "symbol-sdk";

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
  const nsRepo = repositoryFactory.createNamespaceRepository();
  const chainRepo = repositoryFactory.createChainRepository();
  const blockRepo = repositoryFactory.createBlockRepository();

  const namespaceId = new NamespaceId("matsumoto");
  const nsInfo = await nsRepo.getNamespace(namespaceId).toPromise();
  const lastHeight = (await chainRepo.getChainInfo().toPromise()).height;
  const lastBlock = await blockRepo.getBlockByHeight(lastHeight).toPromise();
  const remainHeight = nsInfo.endHeight.compact() - lastHeight.compact();

  const endDate = new Date(
    lastBlock.timestamp.compact() +
      remainHeight * 30000 +
      epochAdjustment * 1000
  );
  console.log(endDate);
};
example().then();

// next 5 モザイク
