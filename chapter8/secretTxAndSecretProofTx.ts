import {
  RepositoryFactoryHttp,
  Account,
  PublicAccount,
  Address,
  TransferTransaction,
  Deadline,
  PlainMessage,
  UInt64,
  TransactionGroup,
  AggregateTransaction,
  MosaicNonce,
  MosaicDefinitionTransaction,
  MosaicId,
  MosaicFlags,
  MosaicSupplyChangeTransaction,
  MosaicSupplyChangeAction,
  Mosaic,
  EmptyMessage,
  NamespaceRegistrationTransaction,
  NamespaceId,
  AliasTransaction,
  AliasAction,
  MetadataTransactionService,
  KeyGenerator,
  HashLockTransaction,
  CosignatureTransaction,
  Crypto,
  SecretLockTransaction,
  LockHashAlgorithm,
  SecretProofTransaction,
} from "symbol-sdk";
import { sha3_256 } from "js-sha3";

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
const carolAddress = "TA6LZRBVFW2NDWJSMSEXBWOWSGFNFOV6KNBNZ4I";
const carolPrivateKey =
  "8909D963511C87FB5FDA6D60067D40CF349155F12048AB2A82E1F42BA99D3B8F";
const carolPublicKey =
  "40E803B6D873F0CF6B7B1B56B38F51A36E8A7382F9E5D4342A5128613546E9D3";
const symbolMosaicId = "72C0212E67A08BCE";
const myMosaicId = "7DF08F144FBC8CC0";

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
  const proof = random.toString('hex');
  console.log("secret:" + secret);
  console.log("proof:" + proof);

  const lockTx = SecretLockTransaction.create(
    Deadline.create(epochAdjustment!),
    new Mosaic(new NamespaceId("symbol.xym"),
    UInt64.fromUint(334000000)
    ),
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
    const res = await slRepo.search({secret:secret}).toPromise();
    console.log(res.data[0])
    setTimeout(async () => {
      const proofTx = SecretProofTransaction.create(
        Deadline.create(epochAdjustment!),
        LockHashAlgorithm.Op_Sha3_256,
        secret,
        bob.address,
        proof,
        networkType!
      ).setMaxFee(100)

      const singedProofTx = bob.sign(proofTx, networkGenerationHash!);
      await txRepo.announce(singedProofTx).toPromise()
      console.log("finish");
    }, 30000)
  }, 30000);

  // const txInfo = await txRepo.getTransaction(signedAggregateTx.hash, TransactionGroup.Partial).toPromise()
  // const cosignatureTx = CosignatureTransaction.create(txInfo as AggregateTransaction);
  // const signedCosTx = bob.signCosignatureTransaction(cosignatureTx)
  // const finishResponse = await txRepo.announceAggregateBondedCosignature(signedCosTx).toPromise();
  // console.log(finishResponse);

  // 各種リポジトリ
  // const txRepo = repositoryFactory.createTransactionRepository();
  // const metaRepo = repositoryFactory.createMetadataRepository();
  // const mosaicRepo = repositoryFactory.createMosaicRepository();
  // const nsRepo = repositoryFactory.createNamespaceRepository();
  // // メタデータサービス
  // const metaService = new MetadataTransactionService(metaRepo);

  // 署名
  // const signedTx = alice.sign(aggregateTx, networkGenerationHash!);
  // console.log("Payload:", signedTx.payload);
  // console.log("Transaction Hash:", signedTx.hash);
  // const response = await txRepo.announce(signedTx).toPromise();
  // console.log(response);
};
example().then();
