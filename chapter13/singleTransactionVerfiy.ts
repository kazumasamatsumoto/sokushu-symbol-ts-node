import {
  Account,
  RepositoryFactoryHttp,
  StateProofService,
  Transaction,
  TransactionMapping,
} from "symbol-sdk";

import cat from "catbuffer-typescript";
import { sha3_256 } from "js-sha3";
import WebSocket from "ws";

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
  const accountRepo = repositoryFactory.createAccountRepository();
  const blockRepo = repositoryFactory.createBlockRepository();
  const stateProofService = new StateProofService(repositoryFactory);
  const AlicePrivateKey =
    "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);

  // ペイロード確認
  const payload =
    "B70000000000000093F16B1922A802998572D79CA1050EEA81BCBCC7B939488ED4EA3700892FDD14C9895CA62F539B4D5FBD38CDF56DC01C8C00E0B16F923EB89B0D3054DF2C9B0EC57096FF4507B39B79F49EB486EBD5E1673B2448974C64231A23CB5BB6E78540000000000198544180841E00000000002285786802000000984FB756BB015CD4E65873288598917B718FFC08917BC1721700000000000000005468697320697320612074657374206D657373616765";
  const height = 258440;
  const tx = TransactionMapping.createFromPayload(payload);

  const hash = Transaction.createTransactionHash(
    payload,
    // @ts-ignore
    Buffer.from(networkGenerationHash!, "hex")
  );
  console.log(hash);
  console.log("--------------------------------");
  console.log(tx);

  // 署名者の検証
  const res = alice.publicAccount.verifySignature(
    // @ts-ignore
    tx.getSigningBytes(
      [...Buffer.from(payload, "hex")],
      [...Buffer.from(networkGenerationHash!, "hex")]
    ),
    "93F16B1922A802998572D79CA1050EEA81BCBCC7B939488ED4EA3700892FDD14C9895CA62F539B4D5FBD38CDF56DC01C8C00E0B16F923EB89B0D3054DF2C9B0E"
  );
  console.log(res);

  // マークルコンポーネントハッシュの計算
};
example()
  .then()
  .catch((err) => console.log(err));
