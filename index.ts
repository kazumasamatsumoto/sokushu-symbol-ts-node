import {
  Account,
  AccountRestrictionTransaction,
  Address,
  AddressRestrictionFlag,
  AggregateTransaction,
  CosignatureSignedTransaction,
  CosignatureTransaction,
  Deadline,
  HashLockTransaction,
  KeyGenerator,
  Listener,
  Mosaic,
  MosaicAddressRestrictionTransaction,
  MosaicDefinitionTransaction,
  MosaicFlags,
  MosaicId,
  MosaicNonce,
  MosaicRestrictionFlag,
  MosaicRestrictionTransactionService,
  MosaicRestrictionType,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  NetworkType,
  OperationRestrictionFlag,
  PlainMessage,
  PublicAccount,
  RepositoryFactoryHttp,
  SignedTransaction,
  Transaction,
  TransactionMapping,
  TransactionService,
  TransactionType,
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

const restrictedAccountsPrivateKey =
  "24A345C541C38289171225EE060A7FAC7E9DF2479DA5FE0BC7C472D0352EB287";
const restrictedAccountsPublicKey =
  "58CEA0752DEE9834F9C9390B3A73FF45F89771BED467DE044B0BC289D7FBEAFC";
const restrictedAccountsAddress = "TCQLB7GNIUKALSSVPJT46VKHPVE2TCP5RXFBOVQ";

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

  const alice = Account.createFromPrivateKey(AlicePrivateKey, networkType!);
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType!);

  const innerTx1 = TransferTransaction.create(
    undefined,
    bob.address,
    [],
    PlainMessage.create("tx1"),
    networkType!
  );

  const innerTx2 = TransferTransaction.create(
    undefined,
    alice.address,
    [],
    PlainMessage.create("tx2"),
    networkType!
  );

  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment!),
    [
      innerTx1.toAggregate(alice.publicAccount),
      innerTx2.toAggregate(bob.publicAccount),
    ],
    networkType!,
    []
  ).setMaxFeeForAggregate(100, 1);

  let signedTx = alice.sign(aggregateTx, networkGenerationHash!);
  let signedHash = signedTx.hash;
  let signedPayload = signedTx.payload;

  console.log(signedPayload);

  const tx = TransactionMapping.createFromPayload(signedPayload);
  console.log(tx);

  const bobSignedTx = CosignatureTransaction.signTransactionPayload(
    bob,
    signedPayload,
    networkGenerationHash!
  );
  const bobSignedTxSignature = bobSignedTx.signature;
  const bobSignedTxSignerPublicKey = bobSignedTx.signerPublicKey;

  const signedHashAfterBob = Transaction.createTransactionHash(
    signedPayload,
    // @ts-ignore
    Buffer.from(networkGenerationHash!, "hex")
  );
  const cosignSignedTxs = [
    new CosignatureSignedTransaction(
      signedHash,
      bobSignedTxSignature,
      bobSignedTxSignerPublicKey
    ),
  ];
  console.log("--------------------------------");
  console.log(cosignSignedTxs);

  const recreatedTx = TransactionMapping.createFromPayload(signedPayload);

  cosignSignedTxs.forEach((cosignedTx) => {
    signedPayload +=
      cosignedTx.version.toHex() +
      cosignedTx.signerPublicKey +
      cosignedTx.signature;
  });

  console.log(
    "----------------------------------------------------------------"
  );
  console.log(signedPayload);

  const size = `00000000${(signedPayload.length / 2).toString(16)}`;
  console.log(
    "----------------------------------------------------------------"
  );
  console.log(size);
  const formatedSize = size.substr(size.length - 8, size.length);
  console.log(
    "----------------------------------------------------------------"
  );
  console.log(formatedSize);
  const littleEndianSize =
    formatedSize.substr(6, 2) +
    formatedSize.substr(4, 2) +
    formatedSize.substr(2, 2) +
    formatedSize.substr(0, 2);
  console.log(
    "----------------------------------------------------------------"
  );
  console.log(littleEndianSize);

  signedPayload =
    littleEndianSize + signedPayload.substr(8, signedPayload.length - 8);
  console.log(
    "----------------------------------------------------------------"
  );
  console.log(signedPayload);
  const signedTxAll = new SignedTransaction(
    signedPayload,
    signedHash,
    alice.publicKey,
    recreatedTx.type,
    recreatedTx.networkType
  );

  const txRepo = repositoryFactory.createTransactionRepository();
  await txRepo.announce(signedTxAll).toPromise();
};
example().then();
