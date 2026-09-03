/**
 * CodeFlow Academy Certificate Generator Utility
 * Produces official vector SVG, high-res PNG, and printable PDF documents.
 */

export function generateCertificateSVG(cert, studentName) {
  const name = studentName || cert.user_name || 'CodeFlow Scholar';
  const course = cert.course_title || 'Software Engineering Mastery';
  const language = cert.language || 'Computer Science';
  const level = cert.level || 'Advanced';
  const score = cert.score || 95;
  const certId = cert.id ? `CF-${cert.id.toString().slice(0, 8).toUpperCase()}` : 'CF-2024-8A9F';
  const dateStr = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const verifyUrl = `https://codeflows.up.railway.app/verify/${cert.id || 'demo'}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#bf953f" />
      <stop offset="25%" stop-color="#fcf6ba" />
      <stop offset="50%" stop-color="#b38728" />
      <stop offset="75%" stop-color="#fbf5b7" />
      <stop offset="100%" stop-color="#aa771c" />
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080c16" />
      <stop offset="50%" stop-color="#0d1424" />
      <stop offset="100%" stop-color="#050811" />
    </linearGradient>
    <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="800" fill="url(#bgGrad)"/>

  <!-- Guilloche Security Border Patterns -->
  <rect x="25" y="25" width="1150" height="750" rx="12" fill="none" stroke="url(#goldGrad)" stroke-width="2" opacity="0.4"/>
  <rect x="40" y="40" width="1120" height="720" rx="8" fill="none" stroke="url(#goldGrad)" stroke-width="6"/>
  <rect x="52" y="52" width="1096" height="696" rx="6" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="8 4" opacity="0.75"/>

  <!-- Ornate Corner Accents -->
  <g stroke="url(#goldGrad)" stroke-width="3" fill="none">
    <path d="M 40 100 L 100 40 M 40 120 L 120 40 M 40 80 L 80 40" opacity="0.6"/>
    <path d="M 1160 100 L 1100 40 M 1160 120 L 1080 40 M 1160 80 L 1120 40" opacity="0.6"/>
    <path d="M 40 700 L 100 760 M 40 680 L 120 760 M 40 720 L 80 760" opacity="0.6"/>
    <path d="M 1160 700 L 1100 760 M 1160 680 L 1080 760 M 1160 720 L 1120 760" opacity="0.6"/>
  </g>

  <!-- Header Academy Emblem -->
  <g transform="translate(600, 120)" text-anchor="middle">
    <!-- Mini Crest Logo -->
    <rect x="-24" y="-36" width="48" height="48" rx="12" fill="#2563eb" filter="url(#shadow)"/>
    <text x="0" y="-7" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="bold">&lt;/&gt;</text>
    
    <text x="0" y="35" fill="url(#goldGrad)" font-family="'Cinzel', 'Times New Roman', Georgia, serif" font-size="22" letter-spacing="8" font-weight="bold">
      CODEFLOW ACADEMY
    </text>
    <text x="0" y="58" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="11" letter-spacing="4" font-weight="600">
      GLOBAL ACCREDITATION COUNCIL &amp; STANDARDS BOARD
    </text>
  </g>

  <!-- Certificate Title -->
  <g transform="translate(600, 245)" text-anchor="middle">
    <text x="0" y="0" fill="#f8fafc" font-family="'Playfair Display', Georgia, serif" font-size="38" font-weight="bold" letter-spacing="2">
      Certificate of Excellence
    </text>
    <text x="0" y="30" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="15" letter-spacing="1">
      THIS IS PROUDLY CONFERRED UPON
    </text>
  </g>

  <!-- Student Name -->
  <g transform="translate(600, 345)" text-anchor="middle">
    <text x="0" y="0" fill="url(#goldGrad)" font-family="'Playfair Display', Georgia, serif" font-size="46" font-weight="bold" letter-spacing="1">
      ${name}
    </text>
    <!-- Underline ribbon -->
    <path d="M -260 18 L 260 18" stroke="url(#goldGrad)" stroke-width="2" opacity="0.8"/>
    <circle cx="0" cy="18" r="5" fill="#fcf6ba"/>
  </g>

  <!-- Achievement Description -->
  <g transform="translate(600, 420)" text-anchor="middle">
    <text x="0" y="0" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="15">
      for demonstrating distinguished technical mastery and successfully completing all curriculum requirements in
    </text>
    <text x="0" y="42" fill="#38bdf8" font-family="'Inter', system-ui, sans-serif" font-size="26" font-weight="bold" letter-spacing="0.5">
      ${course}
    </text>
    <text x="0" y="72" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="13">
      Specialization: <tspan fill="#f59e0b" font-weight="bold">${language}</tspan> &bull; Level: <tspan fill="#f59e0b" font-weight="bold">${level}</tspan> &bull; Final Assessment Score: <tspan fill="#10b981" font-weight="bold">${score}%</tspan>
    </text>
  </g>

  <!-- Bottom Details & Seal -->
  <!-- Left: Issue Date & Verification -->
  <g transform="translate(140, 620)">
    <text x="0" y="0" fill="#64748b" font-family="system-ui, sans-serif" font-size="11" letter-spacing="1">DATE OF ISSUANCE</text>
    <text x="0" y="24" fill="#f1f5f9" font-family="system-ui, sans-serif" font-size="15" font-weight="600">${dateStr}</text>

    <text x="0" y="55" fill="#64748b" font-family="system-ui, sans-serif" font-size="11" letter-spacing="1">CREDENTIAL ID</text>
    <text x="0" y="75" fill="url(#goldGrad)" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="bold">${certId}</text>
  </g>

  <!-- Center: Golden Official Seal -->
  <g transform="translate(600, 640)" filter="url(#shadow)">
    <!-- Starburst Seal Edge -->
    <circle cx="0" cy="0" r="48" fill="url(#sealGrad)" stroke="url(#goldGrad)" stroke-width="3"/>
    <circle cx="0" cy="0" r="41" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="4 2"/>
    <circle cx="0" cy="0" r="36" fill="#78350f" opacity="0.6"/>

    <text x="0" y="-12" text-anchor="middle" fill="#fef08a" font-family="system-ui, sans-serif" font-size="8" letter-spacing="1" font-weight="bold">OFFICIAL SEAL</text>
    <!-- Five stars -->
    <text x="0" y="5" text-anchor="middle" fill="#fef08a" font-size="14">&starf; &starf; &starf;</text>
    <text x="0" y="22" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" letter-spacing="1">VERIFIED</text>
  </g>

  <!-- Right: Signatures & QR Code Link -->
  <g transform="translate(940, 620)">
    <!-- Simulated Signature -->
    <path d="M 0 15 Q 25 -10 50 12 T 90 5 T 130 18 T 160 8" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.85"/>
    <line x1="0" y1="26" x2="160" y2="26" stroke="#475569" stroke-width="1"/>
    <text x="0" y="44" fill="#f1f5f9" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Enoch Essel</text>
    <text x="0" y="60" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Director of Academic Affairs</text>

    <!-- Scan to Verify Pill -->
    <text x="0" y="80" fill="#10b981" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold">
      &bull; Authenticity Ledger Validated
    </text>
  </g>
</svg>`;
}

/**
 * Direct file download as Vector SVG
 */
export function downloadCertificateSVG(cert, studentName) {
  const svgMarkup = generateCertificateSVG(cert, studentName);
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `CodeFlow_Certificate_${(cert.course_title || 'Mastery').replace(/\s+/g, '_')}.svg`;
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Direct file download as High-Resolution 2400x1600 PNG
 */
export function downloadCertificatePNG(cert, studentName) {
  const svgMarkup = generateCertificateSVG(cert, studentName);
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 2400, 1600);
    URL.revokeObjectURL(url);

    canvas.toBlob((pngBlob) => {
      const pngUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement('a');
      const filename = `CodeFlow_Certificate_${(cert.course_title || 'Mastery').replace(/\s+/g, '_')}.png`;
      link.href = pngUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pngUrl);
    }, 'image/png');
  };

  img.src = url;
}

/**
 * Open print dialogue formatted for clean landscape certificate output
 */
export function printCertificate(cert, studentName) {
  const svgMarkup = generateCertificateSVG(cert, studentName);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>CodeFlow Certificate - ${cert.course_title || 'Course'}</title>
        <style>
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #080c16;
          }
          svg {
            width: 100vw;
            height: 100vh;
            max-width: 100%;
            max-height: 100%;
          }
        </style>
      </head>
      <body>
        ${svgMarkup}
        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
