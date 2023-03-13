import {
  Account,
  Address,
  AggregateTransaction,
  BlockType,
  Convert,
  MerklePosition,
  MetadataType,
  NormalBlockInfo,
  PublicAccount,
  RawAddress,
  RepositoryFactoryHttp,
  StateProofService,
  Transaction,
  TransactionMapping,
  UInt64,
} from "symbol-sdk";

import cat, { GeneratorUtils } from "catbuffer-typescript";
import { sha3_256 } from "js-sha3";
import WebSocket from "ws";

// InBlockの検証
const validateTransactionInBlock = (leaf, HRoot, merkleProof) => {
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
};

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-04.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await repositoryFactory
    .getEpochAdjustment()
    .toPromise();
  const networkType = await repositoryFactory.getNetworkType().toPromise();
  let networkGenerationHash = await repositoryFactory
    .getGenerationHash()
    .toPromise();

  // const networkGenerationHash = '7FCCD304802016BEBBCD342A332F91FF1F3BB5E902988B352697BE245F48E836'
  const accountRepo = repositoryFactory.createAccountRepository();
  const blockRepo = repositoryFactory.createBlockRepository();
  const stateProofService = new StateProofService(repositoryFactory);

  const payload =
    "30020000000000001C70F3BAC7A071BFCE85A959860FFDC9A709A13F27EE9EADD09F4A5D9CF668727B95925CA975432C6B05E180A2C61C994B06F520E7CE13DD128956CD8A8B380CC57096FF4507B39B79F49EB486EBD5E1673B2448974C64231A23CB5BB6E785400000000002984141C0DA0000000000008912C7AB02000000141FF381A9E02E2C498C4F0724F47BAB98D3044AA0E38829E8945EAC214D1F1920010000000000005D00000000000000C57096FF4507B39B79F49EB486EBD5E1673B2448974C64231A23CB5BB6E78540000000000198544198029F01FDB35F92E8242375607A2557CF1D5450B5E94F510D000000000000000068656C6C6F2073796D626F6C0000005E00000000000000C57096FF4507B39B79F49EB486EBD5E1673B2448974C64231A23CB5BB6E78540000000000198444198029F01FDB35F92E8242375607A2557CF1D5450B5E94F51D72781051BB77297FAFF0A00000000002D616C69636500005C00000000000000C57096FF4507B39B79F49EB486EBD5E1673B2448974C64231A23CB5BB6E785400000000001984441984FB756BB015CD4E65873288598917B718FFC08917BC172D72781051BB77297FCFF0800000000002D626F620000000000000000000000008FCE44AB3C4A1A9C37EE0C92116BE1A0D4369EF8BC62799335B722D7FA936618121BFE69BA8A06455BDF6508C4A3624DE41FDBCD35F38396184695BCF49EA30815791C9B56882A2D9F481CDF68E8736593CF9E426C09990560660D4AC5DDE700";
  const height = UInt64.fromUint(293281);

  const tx = TransactionMapping.createFromPayload(
    payload
  ) as AggregateTransaction;
  const hash = Transaction.createTransactionHash(
    payload,
    // @ts-ignore
    Buffer.from(networkGenerationHash!, "hex")
  );
  console.log(hash);
  console.log(tx);
  console.log(tx.signer);
  const alice = PublicAccount.createFromPublicKey(
    "C57096FF4507B39B79F49EB486EBD5E1673B2448974C64231A23CB5BB6E78540",
    networkType!
  );
  const res = alice.verifySignature(
    // @ts-ignore
    tx.getSigningBytes(
      [...Buffer.from(payload, "hex")],
      [...Buffer.from(networkGenerationHash!, "hex")]
    ),
    "1C70F3BAC7A071BFCE85A959860FFDC9A709A13F27EE9EADD09F4A5D9CF668727B95925CA975432C6B05E180A2C61C994B06F520E7CE13DD128956CD8A8B380C"
  );
  console.log(res);
  let merkleComponentHash = hash;
  if (tx.cosignatures !== undefined && tx.cosignatures.length > 0) {
    const hasher = sha3_256.create();
    hasher.update(Buffer.from(hash, "hex"));
    for (const cosignature of tx.cosignatures) {
      hasher.update(Buffer.from(cosignature.signer.publicKey, "hex"));
    }
    merkleComponentHash = hasher.hex().toUpperCase();
  }
  console.log(merkleComponentHash);
  const leaf = merkleComponentHash.toLowerCase();
  const HRoot = (await blockRepo.getBlockByHeight(height).toPromise())
    .blockTransactionsHash;
  const merkleProof = (
    await blockRepo.getMerkleTransaction(height, leaf).toPromise()
  ).merklePath;

  const result = validateTransactionInBlock(leaf, HRoot, merkleProof);
  console.log(result);

  const block = await blockRepo.getBlockByHeight(height).toPromise();
  const previousBlock = await blockRepo
    .getBlockByHeight(height.subtract(UInt64.fromUint(1)))
    .toPromise();
  const hasher = sha3_256.create();
  hasher.update(Buffer.from(block.stateHashSubCacheMerkleRoots[0], "hex")); //AccountState
  hasher.update(Buffer.from(block.stateHashSubCacheMerkleRoots[1], "hex")); //Namespace
  hasher.update(Buffer.from(block.stateHashSubCacheMerkleRoots[2], "hex")); //Mosaic
  hasher.update(Buffer.from(block.stateHashSubCacheMerkleRoots[3], "hex")); //Multisig
  hasher.update(Buffer.from(block.stateHashSubCacheMerkleRoots[4], "hex")); //HashLockInfo
  hasher.update(Buffer.from(block.stateHashSubCacheMerkleRoots[5], "hex")); //SecretLockInfo
  hasher.update(Buffer.from(block.stateHashSubCacheMerkleRoots[6], "hex")); //AccountRestriction
  hasher.update(Buffer.from(block.stateHashSubCacheMerkleRoots[7], "hex")); //MosaicRestriction
  hasher.update(Buffer.from(block.stateHashSubCacheMerkleRoots[8], "hex")); //Metadata
  const hashTest = hasher.hex().toUpperCase();
  console.log(block.stateHash === hashTest);
};
example()
  .then()
  .catch((err) => console.log(err));
