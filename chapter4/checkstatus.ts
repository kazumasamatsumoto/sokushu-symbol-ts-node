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
  const tsRepo = repositoryFactory.createTransactionStatusRepository();
  const transactionStatus = await tsRepo
    .getTransactionStatus(
      "E90C84A670F83E19410675BE5CD0FBDB0AB467EADC2ED6910F47A27D1BB96F64"
    )
    .toPromise();
  console.log(transactionStatus);
};
example().then();

// next 4.5 トランザクション履歴
