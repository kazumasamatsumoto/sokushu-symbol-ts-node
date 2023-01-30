import { RepositoryFactoryHttp, Account, ReceiptType } from "symbol-sdk";

const bobAddress = "TBH3OVV3AFONJZSYOMUILGERPNYY77AISF54C4Q";
const bobPrivateKey =
  "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14B4DD568DCD";
const bobPublicKey =
  "8FCE44AB3C4A1A9C37EE0C92116BE1A0D4369EF8BC62799335B722D7FA936618";

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-04.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const networkType = await repositoryFactory.getNetworkType().toPromise();
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);

  const receiptRepo = repositoryFactory.createReceiptRepository();
  const receiptInfo = await receiptRepo.searchReceipts({
    // @ts-ignore
    receiptType: ReceiptType.LockHash_Completed,
    targetAddress: bob.address,
  }).toPromise();
  console.log(receiptInfo.data);
  console.log("test");
};
example()
  .then()
  .catch((err) => console.log(err));
