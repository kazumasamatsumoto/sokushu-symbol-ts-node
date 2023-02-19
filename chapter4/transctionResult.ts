import { RepositoryFactoryHttp, Account, TransactionGroup } from "symbol-sdk";
const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";

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
  const txRepo = repositoryFactory.createTransactionRepository();
  const result = await txRepo
    .search({
      group: TransactionGroup.Confirmed,
      embedded: true,
      address: alice.address,
    })
    .toPromise();
  console.log(result);
};
example().then();

// next 4.5 トランザクション履歴
