import {
  RepositoryFactoryHttp,
  Account,
  PublicAccount,
  Address,
} from "symbol-sdk";
const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
const AlicePublicKey =
  "C57096FF4507B39B79F49EB486EBD5E1673B2448974C64231A23CB5BB6E78540";
const AliceAddress = "TABJ6AP5WNPZF2BEEN2WA6RFK7HR2VCQWXUU6UI";

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
  const accountHttp = repositoryFactory.createAccountRepository();
  const alice = Address.createFromRawAddress(AliceAddress);
  accountHttp.getAccountInfo(alice).subscribe(
    (accountInfo) => {
      accountInfo.mosaics.forEach((mosaic) => {
        console.log("id:" + mosaic.id.toHex()); //16進数
        console.log("amount:" + mosaic.amount.toString()); //文字列
      });
    },
    (err) => console.log(err)
  );
};
example().then();
