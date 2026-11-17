const fs = require('fs');

function genFarPeaks() {
  const peaks = [
    [0, 110], [70, 85], [130, 98], [210, 68], [290, 92], [380, 58], [440, 78],
    [520, 48], [600, 72], [690, 38], [770, 68], [860, 32], [950, 60], [1030, 26],
    [1120, 52], [1210, 34], [1300, 62], [1390, 40], [1480, 68], [1580, 48],
    [1690, 75], [1790, 58], [1920, 78]
  ];
  let d = 'M 0 260 L 0 ' + peaks[0][1] + ' ';
  for (let i = 1; i < peaks.length; i++) {
    d += 'L ' + peaks[i][0] + ' ' + peaks[i][1] + ' ';
  }
  d += 'L 1920 260 Z';
  return d;
}

function genMidRidge() {
  const pts = [
    [0, 130], [85, 110], [190, 125], [300, 95], [410, 115], [510, 88], [620, 112],
    [730, 80], [840, 106], [940, 74], [1050, 98], [1160, 70], [1270, 102],
    [1380, 80], [1490, 108], [1600, 84], [1720, 110], [1820, 94], [1920, 114]
  ];
  let d = 'M 0 260 L 0 ' + pts[0][1] + ' ';
  for (let i = 1; i < pts.length; i++) {
    d += 'L ' + pts[i][0] + ' ' + pts[i][1] + ' ';
  }
  d += 'L 1920 260 Z';
  return d;
}

function genCloseRidge() {
  const pts = [
    [0, 150], [105, 130], [220, 144], [340, 122], [460, 138], [580, 116], [700, 132],
    [820, 110], [940, 126], [1060, 108], [1180, 128], [1300, 110], [1420, 132],
    [1540, 112], [1660, 130], [1780, 118], [1920, 136]
  ];
  let d = 'M 0 260 L 0 ' + pts[0][1] + ' ';
  for (let i = 1; i < pts.length; i++) {
    d += 'L ' + pts[i][0] + ' ' + pts[i][1] + ' ';
  }
  d += 'L 1920 260 Z';
  return d;
}

function genPineForest(baseY) {
  let path = 'M 0 ' + baseY + ' ';
  let x = 0;
  while (x < 1920) {
    const seed = Math.sin(x * 0.035) * 8 + Math.cos(x * 0.08) * 6;
    const treeH = 26 + seed + Math.abs(Math.sin(x * 0.12)) * 10;
    const treeW = 8 + treeH * 0.22;
    const peakY = baseY - treeH;
    const midY = baseY - treeH * 0.52;
    const lowY = baseY - treeH * 0.22;

    path += 'L ' + Math.round(x) + ' ' + Math.round(baseY) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.2) + ' ' + Math.round(lowY) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.16) + ' ' + Math.round(midY + 2) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.35) + ' ' + Math.round(midY) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.26) + ' ' + Math.round(peakY + 4) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.5) + ' ' + Math.round(peakY) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.74) + ' ' + Math.round(peakY + 4) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.65) + ' ' + Math.round(midY) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.84) + ' ' + Math.round(midY + 2) + ' ';
    path += 'L ' + Math.round(x + treeW * 0.8) + ' ' + Math.round(lowY) + ' ';
    path += 'L ' + Math.round(x + treeW) + ' ' + Math.round(baseY) + ' ';

    x += treeW * 0.68;
  }
  path += 'L 1920 260 L 0 260 Z';
  return path;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 260" preserveAspectRatio="xMidYEnd slice" width="100%" height="100%">
  <defs>
    {/* Clean, authentic dimmed atmospheric mountain sky (not black!) */}
    <linearGradient id="cleanSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#5a889c" />
      <stop offset="35%" stop-color="#3c697c" />
      <stop offset="70%" stop-color="#244f60" />
      <stop offset="100%" stop-color="#143644" />
    </linearGradient>

    {/* Far misty peaks */}
    <linearGradient id="cleanFarPeaks" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#6fa0b5" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#2b5364" />
    </linearGradient>

    {/* Mid ridge */}
    <linearGradient id="cleanMidPeaks" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#345e71" />
      <stop offset="100%" stop-color="#193b4a" />
    </linearGradient>

    {/* Close ridge */}
    <linearGradient id="cleanClosePeaks" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#224757" />
      <stop offset="100%" stop-color="#112c38" />
    </linearGradient>

    {/* Pine forest */}
    <linearGradient id="cleanForest" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#13313d" />
      <stop offset="50%" stop-color="#0e2630" />
      <stop offset="100%" stop-color="#0a202a" />
    </linearGradient>

    {/* Soft atmospheric cloud haze */}
    <linearGradient id="cloudHaze" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8bb7cb" stop-opacity="0.3" />
      <stop offset="50%" stop-color="#5a889c" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#143644" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="1920" height="260" fill="url(#cleanSky)" />
  <rect width="1920" height="150" fill="url(#cloudHaze)" />

  <!-- Mountain layers -->
  <path d="${genFarPeaks()}" fill="url(#cleanFarPeaks)" />
  <path d="${genMidRidge()}" fill="url(#cleanMidPeaks)" />
  <path d="${genCloseRidge()}" fill="url(#cleanClosePeaks)" />

  <!-- Dense pine forest -->
  <path d="${genPineForest(220)}" fill="url(#cleanForest)" />

  <!-- Base transition to #0a202a -->
  <rect y="240" width="1920" height="20" fill="#0a202a" />
</svg>`;

fs.writeFileSync('c:/Users/kusha/OneDrive/Desktop/project trecking F/kharka-trekking/public/images/footer-mountains-clean.svg', svg);
console.log('Saved clean dimmed footer-mountains-clean.svg successfully!');
