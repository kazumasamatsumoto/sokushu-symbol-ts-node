


import {
  RepositoryFactoryHttp,
  Account,
  PublicAccount,
  Address,
  TransferTransaction,
  Deadline,
  PlainMessage,
  UInt64,
} from "symbol-sdk";
const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
const AlicePublicKey =
  "C57096FF4507B39B79F49EB486EBD5E1673B2448974C64231A23CB5BB6E78540";
const AliceAddress = "TABJ6AP5WNPZF2BEEN2WA6RFK7HR2VCQWXUU6UI";

const bobAddress = "TBH3OVV3AFONJZSYOMUILGERPNYY77AISF54C4Q";
const bobPrivateKey =
  "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14B4DD568DCD";
const bobPublicKey =
  "8FCE44AB3C4A1A9C37EE0C92116BE1A0D4369EF8BC62799335B722D7FA936618";

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