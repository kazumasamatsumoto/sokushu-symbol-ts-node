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
  MerklePosition,
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
  StateProofService,
  Transaction,
  TransactionMapping,
  TransactionService,
  TransactionType,
  TransferTransaction,
  UInt64,
} from "symbol-sdk";

import cat from "catbuffer-typescript";
import { sha3_256 } from "js-sha3";
import WebSocket from "ws";

// InBlockの検証
function validateTransactionInBlock(leaf, HRoot, merkleProof) {
  if (merkleProof.length === 0) {
    return leaf.toUpperCase() === HRoot.toUpperCase();
  }

  const HRoot0 = merkleProof.reduce((proofHash, pathItem) => {
    const hasher = sha3_256.create();
    if (pathItem.position === MerklePosition.Left) {
      return hasher.update(Buffer.from(pathItem.hash + proofHash, "hex")).hex();
    } else {
      return hasher.update(Buffer.from(proofHash + pathItem.hash, "hex")).hex();
    }
  }, leaf);
  return HRoot.toUpperCase() === HRoot0.toUpperCase();
}

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
    "6801000000000000E2666BDFB86429907BA105ADAF1D3C3BD65AF5057332775A1AF89B0FB5A0DD8EB146A59515186A6B067B21396C9FCDAB8F70D697549C346A8C6011A5E812C60BC57096FF4507B39B79F49EB486EBD5E1673B2448974C64231A23CB5BB6E78540000000000298414240B50000000000005B598568020000005FB59DE118CD751FCD9F1CE895537A15E1F53C90EE0C1AFD400EE76827F1EDB0C0000000000000006000000000000000C57096FF4507B39B79F49EB486EBD5E1673B2448974C64231A23CB5BB6E785400000000001985441984FB756BB015CD4E65873288598917B718FFC08917BC1720000010000000000EEAFF441BA994BE740420F00000000005B000000000000008FCE44AB3C4A1A9C37EE0C92116BE1A0D4369EF8BC62799335B722D7FA936618000000000198544198029F01FDB35F92E8242375607A2557CF1D5450B5E94F510B00000000000000007468616E6B20796F75210000000000";
  const height = 258465;
  const tx = TransactionMapping.createFromPayload(
    payload
  ) as AggregateTransaction;
  console.log(tx)

  const hash = Transaction.createTransactionHash(
    payload,
    // @ts-ignore
    Buffer.from(networkGenerationHash!, "hex")
  );

  // 署名者の検証
  const res = alice.publicAccount.verifySignature(
    // @ts-ignore
    tx.getSigningBytes(
      [...Buffer.from(payload, "hex")],
      [...Buffer.from(networkGenerationHash!, "hex")]
    ),
    "E2666BDFB86429907BA105ADAF1D3C3BD65AF5057332775A1AF89B0FB5A0DD8EB146A59515186A6B067B21396C9FCDAB8F70D697549C346A8C6011A5E812C60B"
  );

  // // マークルコンポーネントハッシュの計算
  let merkleComponentHash = hash;
  if (tx.cosignatures !== undefined && tx.cosignatures.length > 0) {
    const hasher = sha3_256.create();
    hasher.update(Buffer.from(hash, "hex"));
    for (const cosignature of tx.cosignatures) {
      hasher.update(Buffer.from(cosignature.signer.publicKey, "hex"));
    }
    merkleComponentHash = hasher.hex().toUpperCase();
  }

  const leaf = hash.toLowerCase();
  // @ts-ignore
  const HRoot = await blockRepo.getBlockByHeight(height).toPromise();
  const sample = HRoot.blockTransactionsHash;

  const merkleProof = await blockRepo
    // @ts-ignore
    .getMerkleTransaction(height, leaf)
    .toPromise();
  const sample2 = merkleProof.merklePath;

  const result = validateTransactionInBlock(leaf, sample, sample2);

};
example()
  .then()
  .catch((err) => console.log(err));
