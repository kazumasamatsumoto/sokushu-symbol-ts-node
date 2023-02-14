import {
  Account,
  Address,
  AggregateTransaction,
  Deadline,
  HashLockTransaction,
  Listener,
  Mosaic,
  MosaicId,
  NetworkType,
  PlainMessage,
  PublicAccount,
  RepositoryFactoryHttp,
  TransactionService,
  TransferTransaction,
  UInt64,
} from "symbol-sdk";
import { sha3_256 } from "js-sha3";
import WebSocket from "ws";

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
const davitPrivateKey =
  "CE13ADB8CCB0E5A9567525EA1EC86B40E24FB0B273FF924852C1124C308263E8";
const davitPublicKey =
  "9DCA6B5162A2466CFFA01D31FACC31CABF065568A78680E47CB1C879B4202BAD";
const davitAddress = "TCZYLNV7CRTI2AAWUENQ6UHCFWSBIGRVTANIU4A";
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

  const networkCurrencyMosaicId = new MosaicId(symbolMosaicId);
  const networkCurrencyDivisibility = 6;

  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);
  const carol = Account.createFromPrivateKey(carolPrivateKey, networkType!);

  const nsRepo = repositoryFactory.createNamespaceRepository();
  const wsEndpoint = nodeUrl.replace("http", "ws") + "/ws";
  const listener = new Listener(wsEndpoint, nsRepo, WebSocket);
  listener.open().then(() => {
    listener
      .aggregateBondedAdded(bob.address)
      .subscribe(async (tx) => console.log("こいつ動くぞ", tx));

    listener
      .aggregateBondedAdded(carol.address)
      .subscribe(async (tx) => console.log("こいつも動くんかな？", tx));
  });

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
