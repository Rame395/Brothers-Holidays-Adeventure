const fs = require('fs');

function genFarPeaks() {
  const peaks = [
    [0, 200], [70, 160], [130, 185], [210, 130], [290, 175], [380, 115], [440, 150],
    [520, 95], [600, 140], [690, 75], [770, 130], [860, 65], [950, 120], [1030, 55],
    [1120, 105], [1210, 70], [1300, 125], [1390, 80], [1480, 135], [1580, 95],
    [1690, 150], [1790, 115], [1920, 155]
  ];
  let d = 'M 0 450 L 0 ' + peaks[0][1] + ' ';
  for (let i = 1; i < peaks.length; i++) {
    d += 'L ' + peaks[i][0] + ' ' + peaks[i][1] + ' ';
  }
  d += 'L 1920 450 Z';
  return d;
}

function genMidRidge() {
  const pts = [
    [0, 240], [85, 200], [190, 230], [300, 175], [410, 215], [510, 160], [620, 205],
    [730, 145], [840, 195], [940, 135], [1050, 180], [1160, 130], [1270, 190],
    [1380, 150], [1490, 200], [1600, 155], [1720, 205], [1820, 175], [1920, 210]
  ];
  let d = 'M 0 450 L 0 ' + pts[0][1] + ' ';
  for (let i = 1; i < pts.length; i++) {
    d += 'L ' + pts[i][0] + ' ' + pts[i][1] + ' ';
  }
  d += 'L 1920 450 Z';
  return d;
}

function genCloseRidge() {
  const pts = [
    [0, 275], [105, 240], [220, 265], [340, 225], [460, 255], [580, 215], [700, 245],
    [820, 205], [940, 235], [1060, 200], [1180, 240], [1300, 205], [1420, 245],
    [1540, 210], [1660, 245], [1780, 220], [1920, 255]
  ];
  let d = 'M 0 450 L 0 ' + pts[0][1] + ' ';
  for (let i = 1; i < pts.length; i++) {
    d += 'L ' + pts[i][0] + ' ' + pts[i][1] + ' ';
  }
  d += 'L 1920 450 Z';
  return d;
}

function genPineForest(baseY) {
  let path = 'M 0 ' + baseY + ' ';
  let x = 0;
  while (x < 1920) {
    const seed = Math.sin(x * 0.035) * 12 + Math.cos(x * 0.08) * 8;
    const treeH = 44 + seed + Math.abs(Math.sin(x * 0.12)) * 14;
    const treeW = 11 + treeH * 0.22;
    const peakY = baseY - treeH;
    const midY = baseY - treeH * 0.52;
    const lowY = baseY - treeH * 0.22;

    path += 'L ' + Math.round(x) + ' ' + Math.round(baseY) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.2) + ' ' + Math.round(lowY) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.16) + ' ' + Math.round(midY + 3) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.35) + ' ' + Math.round(midY) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.26) + ' ' + Math.round(peakY + 5) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.5) + ' ' + Math.round(peakY) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.74) + ' ' + Math.round(peakY + 5) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.65) + ' ' + Math.round(midY) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.84) + ' ' + Math.round(midY + 3) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.8) + ' ' + Math.round(lowY) + ' ';
    path += 'L ' + Math.round(x + treeW) + ' ' + Math.round(baseY) + ' ';

    x += treeW * 0.68;
  }
  path += 'L 1920 450 L 0 450 Z';
  return path;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 450" preserveAspectRatio="xMidYEnd slice" width="100%" height="100%">
  <defs>
    {/* Deep dusk sky gradient */}
    <linearGradient id="skyDusk" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#12303c" stop-opacity="0.95" />
      <stop offset="35%" stop-color="#0e252f" stop-opacity="0.98" />
      <stop offset="70%" stop-color="#081820" />
      <stop offset="100%" stop-color="#040e13" />
    </linearGradient>

    {/* Far snowy ridge gradient */}
    <linearGradient id="farPeakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a6073" stop-opacity="0.65" />
      <stop offset="60%" stop-color="#184150" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#081c24" />
    </linearGradient>

    {/* Mid ridge gradient */}
    <linearGradient id="midPeakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1c4858" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#061820" />
    </linearGradient>

    {/* Close ridge gradient */}
    <linearGradient id="closePeakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#123542" />
      <stop offset="100%" stop-color="#051218" />
    </linearGradient>

    {/* Pine forest gradient */}
    <linearGradient id="forestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a222b" />
      <stop offset="45%" stop-color="#05141a" />
      <stop offset="100%" stop-color="#030c10" />
    </linearGradient>

    <linearGradient id="hazeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1d4a5a" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#040e13" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Sky Background -->
  <rect width="1920" height="450" fill="url(#skyDusk)" />

  <!-- Atmospheric Haze -->
  <rect width="1920" height="260" fill="url(#hazeGrad)" />

  <!-- Distant High Himalayan Peaks -->
  <path d="${genFarPeaks()}" fill="url(#farPeakGrad)" />

  <!-- Mid Range Mountain Ridge -->
  <path d="${genMidRidge()}" fill="url(#midPeakGrad)" />

  <!-- Near Ridge -->
  <path d="${genCloseRidge()}" fill="url(#closePeakGrad)" />

  <!-- Dense Pine Forest Silhouette -->
  <path d="${genPineForest(385)}" fill="url(#forestGrad)" />

  <!-- Base Blend to Deep Alpine Navy -->
  <rect y="420" width="1920" height="30" fill="#030c10" />
</svg>`;

fs.writeFileSync('c:/Users/kusha/OneDrive/Desktop/project trecking F/kharka-trekking/public/images/footer-mountains.svg', svg);
console.log('Saved enhanced footer-mountains.svg successfully!');
