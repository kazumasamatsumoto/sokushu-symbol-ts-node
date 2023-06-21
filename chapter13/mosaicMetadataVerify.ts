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

//葉のハッシュ値取得関数
const getLeafHash = (encodedPath, leafValue) => {
  const hasher = sha3_256.create();
  return hasher
    .update(Convert.hexToUint8(encodedPath + leafValue))
    .hex()
    .toUpperCase();
};

//枝のハッシュ値取得関数
const getBranchHash = (encodedPath, links) => {
  const branchLinks = Array(16).fill(Convert.uint8ToHex(new Uint8Array(32)));
  links.forEach((link) => {
    branchLinks[parseInt(`0x${link.bit}`, 16)] = link.link;
  });
  const hasher = sha3_256.create();
  const bHash = hasher
    .update(Convert.hexToUint8(encodedPath + branchLinks.join("")))
    .hex()
    .toUpperCase();
  return bHash;
};

//ワールドステートの検証
const checkState = (stateProof, stateHash, pathHash, rootHash) => {
  const merkleLeaf = stateProof.merkleTree.leaf;
  const merkleBranches = stateProof.merkleTree.branches.reverse();
  const leafHash = getLeafHash(merkleLeaf.encodedPath, stateHash);

  let linkHash = leafHash; //最初のlinkHashはleafHash
  let bit = "";
  for (let i = 0; i < merkleBranches.length; i++) {
    const branch = merkleBranches[i];
    const branchLink = branch.links.find((x) => x.link === linkHash);
    linkHash = getBranchHash(branch.encodedPath, branch.links);
    bit =
      merkleBranches[i].path.slice(0, merkleBranches[i].nibbleCount) +
      branchLink.bit +
      bit;
  }

  const treeRootHash = linkHash; //最後のlinkHashはrootHash
  let treePathHash = bit + merkleLeaf.path;

  if (treePathHash.length % 2 == 1) {
    treePathHash = treePathHash.slice(0, -1);
  }

  //検証
  console.log(treeRootHash === rootHash);
  console.log(treePathHash === pathHash);
};

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
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
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

  const srcAddress = Buffer.from(
    Address.createFromRawAddress(
      "TABJ6AP5WNPZF2BEEN2WA6RFK7HR2VCQWXUU6UI"
    ).encoded(),
    "hex"
  );

  const targetAddress = Buffer.from(
    Address.createFromRawAddress(
      "TABJ6AP5WNPZF2BEEN2WA6RFK7HR2VCQWXUU6UI"
    ).encoded(),
    "hex"
  );

  const hasher4 = sha3_256.create();
  hasher4.update(srcAddress);
  hasher4.update(targetAddress);
  hasher4.update(Convert.hexToUint8Reverse("CF217E116AA422E2")); // scopeKey
  hasher4.update(Convert.hexToUint8Reverse("7DF08F144FBC8CC0")); // targetId
  hasher4.update(Uint8Array.from([MetadataType.Mosaic])); // type: Account 0
  const compositeHash = hasher4.hex();

  const hasher5 = sha3_256.create();
  hasher5.update(Buffer.from(compositeHash, "hex"));

  const pathHash = hasher5.hex().toUpperCase();

  //stateHash(Value値)
  const hasher6 = sha3_256.create();
  hasher6.update(GeneratorUtils.uintToBuffer(1, 2)); //version
  hasher6.update(srcAddress);
  hasher6.update(targetAddress);
  hasher6.update(Convert.hexToUint8Reverse("CF217E116AA422E2")); // scopeKey
  hasher6.update(Convert.hexToUint8Reverse("7DF08F144FBC8CC0")); // targetId
  hasher6.update(Uint8Array.from([MetadataType.Mosaic])); //account

  const value = Buffer.from("test-mosaic");

  hasher6.update(GeneratorUtils.uintToBuffer(value.length, 2));
  hasher6.update(value);
  const stateHash = hasher6.hex();

  //サービス提供者以外のノードから最新のブロックヘッダー情報を取得
  // @ts-ignore
  const blockInfo2 = await blockRepo.search({ order: "desc" }).toPromise();

  const rootHash2 = blockInfo2.data[0].stateHashSubCacheMerkleRoots[8];

  //サービス提供者を含む任意のノードからマークル情報を取得

  const stateProof2 = await stateProofService
    .metadataById(compositeHash)
    .toPromise();

  //検証
  checkState(stateProof2, stateHash, pathHash, rootHash2);
};
example()
  .then()
  .catch((err) => console.log(err));
