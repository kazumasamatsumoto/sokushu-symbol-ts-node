import {
  RepositoryFactoryHttp,
  Account,
  Deadline,
  UInt64,
  Mosaic,
  NamespaceId,
  Crypto,
  SecretLockTransaction,
  LockHashAlgorithm,
  SecretProofTransaction,
} from "symbol-sdk";
import { sha3_256 } from "js-sha3";

const AlicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329EF391D0EB";
const bobPrivateKey =
  "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14B4DD568DCD";

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
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);
  const txRepo = repositoryFactory.createTransactionRepository();

  console.log(bob.address);

  const random = Crypto.randomBytes(20);
  const hash = sha3_256.create();
  const secret = hash.update(random).hex();
  const proof = random.toString("hex");
  console.log("secret:" + secret);
  console.log("proof:" + proof);

  const lockTx = SecretLockTransaction.create(
    Deadline.create(epochAdjustment!),
    new Mosaic(new NamespaceId("symbol.xym"), UInt64.fromUint(334000000)),
    UInt64.fromUint(480),
    LockHashAlgorithm.Op_Sha3_256,
    secret,
    bob.address,
    networkType!
  ).setMaxFee(100);

  const signedLockTx = alice.sign(lockTx, networkGenerationHash!);
  await txRepo.announce(signedLockTx).toPromise();

  setTimeout(async () => {
    const slRepo = repositoryFactory.createSecretLockRepository();
    const res = await slRepo.search({ secret: secret }).toPromise();
    console.log(res.data[0]);
    setTimeout(async () => {
      const proofTx = SecretProofTransaction.create(
        Deadline.create(epochAdjustment!),
        LockHashAlgorithm.Op_Sha3_256,
        secret,
        bob.address,
        proof,
        networkType!
      ).setMaxFee(100);

      const singedProofTx = bob.sign(proofTx, networkGenerationHash!);
      await txRepo.announce(singedProofTx).toPromise();
      console.log("finish");
    }, 30000);
  }, 30000);
};
example().then();
