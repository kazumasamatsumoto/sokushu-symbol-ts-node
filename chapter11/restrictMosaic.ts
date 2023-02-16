import {
  Account,
  AccountRestrictionTransaction,
  Address,
  AddressRestrictionFlag,
  AggregateTransaction,
  Deadline,
  HashLockTransaction,
  Listener,
  Mosaic,
  MosaicId,
  MosaicRestrictionFlag,
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

const restrictedAccountsPrivateKey = "24A345C541C38289171225EE060A7FAC7E9DF2479DA5FE0BC7C472D0352EB287"
const restrictedAccountsPublicKey = "58CEA0752DEE9834F9C9390B3A73FF45F89771BED467DE044B0BC289D7FBEAFC"
const restrictedAccountsAddress = "TCQLB7GNIUKALSSVPJT46VKHPVE2TCP5RXFBOVQ"

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
  const restrict = Account.createFromPrivateKey(restrictedAccountsPrivateKey, networkType!);

  const mosaicId = new MosaicId("72C0212E67A08BCE");
  const tx = AccountRestrictionTransaction.createMosaicRestrictionModificationTransaction(
    Deadline.create(epochAdjustment!),
    MosaicRestrictionFlag.BlockMosaic,
    [mosaicId],
    [],
    networkType!,
  ).setMaxFee(100);
  const signedTx = restrict.sign(tx, networkGenerationHash!);
  const txRepo = repositoryFactory.createTransactionRepository();

  await txRepo.announce(signedTx).toPromise();


};
example().then();
