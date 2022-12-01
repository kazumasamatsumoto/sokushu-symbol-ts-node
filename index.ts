import { Account, EncryptedMessage, KeyPair } from 'symbol-sdk';
import { Buffer } from 'buffer';
const testNetNetWorkType = 152;
const alicePrivateKey =
  '77A5D7ACA9DA4F926087DB1B3D5AA472AF70CF830440B9D21C32A48B1A46C6BC';
const alicePublicKey =
  '01948AD2622CF4BA7EFC2083534222AD0A5C6EB6D839569BAA2D721479266EFC';
const bobPrivateKey =
  'E1BBC666BD11F7B368AB3EA2C9E2805FFE47D6CACB6AE720ACBFEB40C27566FA';
const bobPublicKey =
  'E38EC6D545C8751AFDE27F0C8FCD16026346C66772711BEDC38A4A10584C7DA8';

const alice = Account.createFromPrivateKey(alicePrivateKey, testNetNetWorkType);
const bob = Account.createFromPrivateKey(bobPrivateKey, testNetNetWorkType);

const payload = Buffer.from("Hello Symol!", 'utf-8');
// @ts-ignore
const signature = Buffer.from(KeyPair.sign(alice.keyPair, payload)).toString("hex").toUpperCase()
console.log(signature)

const isVerified = KeyPair.verify(
  // @ts-ignore
  alice.keyPair.publicKey,
  Buffer.from("Hello Symol!", 'utf-8'),
  Buffer.from(signature, 'hex')
)
console.log(isVerified)