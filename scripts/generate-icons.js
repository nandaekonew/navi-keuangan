const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function distToRoundedRect(px, py, rx, ry, rw, rh, rad) {
  // Center is rx, ry. Width is rw, Height is rh.
  const dx = Math.abs(px - rx) - (rw / 2 - rad);
  const dy = Math.abs(py - ry) - (rh / 2 - rad);
  const outsideX = Math.max(dx, 0);
  const outsideY = Math.max(dy, 0);
  const distOutside = Math.sqrt(outsideX * outsideX + outsideY * outsideY);
  const distInside = Math.min(Math.max(dx, dy), 0);
  return distOutside + distInside - rad;
}

function renderNaviIcon(size, isMaskable = false) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const rowLen = 1 + size * 4;
  const raw = Buffer.alloc(size * rowLen);

  const center = size / 2;
  const bgRadius = isMaskable ? 0 : size * 0.22; // Squircle for normal, full bleed for maskable
  const bgWidth = isMaskable ? size : size * 0.92;
  const bgHeight = isMaskable ? size : size * 0.92;

  // Scale for wallet drawing inside safe area
  const scale = size * (isMaskable ? 0.48 : 0.55);

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowLen;
    raw[rowOffset] = 0; // Filter None

    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // 1. Background Mask
      let bgDist = 0;
      if (!isMaskable) {
        bgDist = distToRoundedRect(x, y, center, center, bgWidth, bgHeight, bgRadius);
      }
      
      let bgAlpha = 1.0;
      if (bgDist > 0) {
        bgAlpha = Math.max(0, 1.0 - bgDist);
      }
      if (bgAlpha <= 0) {
        raw[pxOffset] = 0;
        raw[pxOffset + 1] = 0;
        raw[pxOffset + 2] = 0;
        raw[pxOffset + 3] = 0;
        continue;
      }

      // Background Emerald Gradient
      const gradT = (x + y) / (size * 2);
      let r = Math.round(5 + (13 - 5) * gradT);    // 5 -> 13
      let g = Math.round(150 + (180 - 150) * gradT); // 150 -> 180
      let b = Math.round(105 + (140 - 105) * gradT); // 105 -> 140

      // 2. Draw Wallet in Center
      // Normalized coordinates from -1 to 1 centered at (center, center)
      const nx = (x - center) / (scale / 2);
      const ny = (y - center) / (scale / 2);

      // Main Wallet Body: rounded rect: w=1.35, h=0.95, r=0.22, center=(0, 0.05)
      const walletDist = distToRoundedRect(nx, ny, 0, 0.05, 1.35, 0.95, 0.22);

      // Wallet Top Lip / Card opening line: cut at ny = -0.12
      // Clasp tab: rounded rect at center=(0.35, 0.08), w=0.55, h=0.32, r=0.12
      const claspDist = distToRoundedRect(nx, ny, 0.35, 0.08, 0.55, 0.32, 0.12);
      // Clasp button: circle at center=(0.48, 0.08), r=0.065
      const buttonDist = Math.sqrt((nx - 0.48) ** 2 + (ny - 0.08) ** 2) - 0.065;

      // Decorative card top: slot peeking out
      const cardDist = distToRoundedRect(nx, ny, -0.15, -0.32, 0.75, 0.22, 0.08);

      let isWalletPixel = false;
      let isAccentPixel = false;

      // Card peeking:
      if (cardDist < 0 && ny < -0.22) {
        isAccentPixel = true;
      }

      // Main wallet body:
      if (walletDist < 0) {
        isWalletPixel = true;

        // Seam / card pocket indentation (shadow groove)
        const pocketLineDist = Math.abs(ny - (-0.12));
        if (pocketLineDist < 0.035 && nx < 0.55 && nx > -0.55) {
          isWalletPixel = false;
        }

        // Inner clasp border shadow
        if (claspDist > 0 && claspDist < 0.04 && nx > 0.05 && Math.abs(ny - 0.08) < 0.22) {
          isWalletPixel = false; // Shadow outline around clasp
        }
      }

      // Clasp tab itself:
      if (claspDist < 0) {
        isWalletPixel = true;
        // Button hole in clasp:
        if (buttonDist < 0) {
          isAccentPixel = true;
        }
      }

      if (isAccentPixel) {
        // Gold / emerald accent for peeking card & clasp dot
        r = Math.round(250 * bgAlpha);
        g = Math.round(204 * bgAlpha); // Amber-400 / gold
        b = Math.round(21 * bgAlpha);
      } else if (isWalletPixel) {
        // Pure crisp white with subtle specular gradient
        const val = Math.min(255, Math.round(248 + 7 * (1 - ny)));
        r = Math.round(val * bgAlpha);
        g = Math.round(val * bgAlpha);
        b = Math.round(val * bgAlpha);
      }

      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = Math.round(255 * bgAlpha);
    }
  }

  const idat = makeChunk('IDAT', zlib.deflateSync(raw, { level: 9 }));
  const iend = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

const publicDir = path.join(__dirname, '..', 'public');

console.log('Generating PWA icons in:', publicDir);

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), renderNaviIcon(192, false));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), renderNaviIcon(512, false));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-192.png'), renderNaviIcon(192, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), renderNaviIcon(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), renderNaviIcon(180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), renderNaviIcon(64, false));

console.log('Successfully generated all PWA icons!');
