const sjcl = require("./libs-for-mii.cjs/node_modules/sjcl");

sjcl.codec.bytes = {
  fromBits: function (arr) {
    var out = [], bl = sjcl.bitArray.bitLength(arr), i, tmp;
    for (i=0; i<bl/8; i++) {
      if ((i&3) === 0) {
        tmp = arr[i/4];
      }
      out.push(tmp >>> 24);
      tmp <<= 8;
    }
    return out;
  },
  
  toBits: function (bytes) {
    var out = [], i, tmp=0;
    for (i=0; i<bytes.length; i++) {
      tmp = tmp << 8 | bytes[i];
      if ((i&3) === 3) {
        out.push(tmp);
        tmp = 0;
      }
    }
    if (i&3) {
      out.push(sjcl.bitArray.partial(8*(i&3), tmp));
    }
    return out;
  }
};

function crc16(data) {
  let crc = 0;
  let msb = crc >> 8;
  let lsb = crc & 0xFF;

  for (let i = 0; i < data.length; i++) {
    let c = data[i];
    let x = c ^ msb;
    x ^= (x >> 4);
    msb = (lsb ^ (x >> 3) ^ (x << 4)) & 0xFF;
    lsb = (x ^ (x << 5)) & 0xFF;
  }

  crc = (msb << 8) + lsb;
  return crc;
}

function toByteArray(num) {
  return [(num >> 8) & 0xFF, num & 0xFF];
}


function encryptAesCcm(data) {
    // effectively changes birth platform to 3ds
    // if this is not set then the code
    // will not scan on 3ds (wiiu sets this)
    data[0x03] = 0x30; //'0'
    // Assuming sjcl.codec.bytes is properly defined
    let nonce = data.slice(12, 20);
    let content = [...data.slice(0, 12), ...data.slice(20)];
  
    let checksumContent = [...data.slice(0, 12), ...nonce, ...data.slice(20, -2)];
    let newChecksum = crc16(new Uint8Array(checksumContent));
    content = [...content.slice(0, -2), ...toByteArray(newChecksum)];
  
    let key = sjcl.codec.hex.toBits('59FC817E6446EA6190347B20E9BDCE52');
    let cipher = new sjcl.cipher.aes(key);
  
    let paddedContent = new Uint8Array([...content, ...new Array(8).fill(0)]);
    let paddedContentBits = sjcl.codec.bytes.toBits(Array.from(paddedContent));
    let nonceBits = sjcl.codec.bytes.toBits([...nonce, 0, 0, 0, 0]);
  
    let encryptedBits = sjcl.mode.ccm.encrypt(cipher, paddedContentBits, nonceBits, [], 128);
    let encryptedBytes = sjcl.codec.bytes.fromBits(encryptedBits);
  
    let correctEncryptedContentLength = encryptedBytes.length - 8 - 16;
    let encryptedContentCorrected = encryptedBytes.slice(0, correctEncryptedContentLength);
    let tag = encryptedBytes.slice(encryptedBytes.length - 16);
  
    let result = new Uint8Array([...nonce, ...encryptedContentCorrected, ...tag]);
    return result;
 }

module.exports = {
    encryptAesCcm
  };