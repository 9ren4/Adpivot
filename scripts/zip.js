/**
 * Packages the /dist folder into ad-redirect-v{version}.zip
 * Run: node scripts/zip.js
 */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'))
const version = pkg.version
const zipName = `ad-redirect-v${version}.zip`
const distDir = path.join(__dirname, '..', 'dist')

if (!fs.existsSync(distDir)) {
  console.error('Error: /dist directory not found. Run `npm run build` first.')
  process.exit(1)
}

try {
  if (process.platform === 'win32') {
    execSync(
      `powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${path.join(__dirname, '..', zipName)}' -Force"`,
      { stdio: 'inherit' }
    )
  } else {
    execSync(`cd "${distDir}" && zip -r "../${zipName}" .`, { stdio: 'inherit' })
  }
  console.log(`\nCreated: ${zipName}`)
} catch (err) {
  console.error('Zip failed:', err.message)
  process.exit(1)
}
