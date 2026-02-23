const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'docs', 'browser');
const destDir = path.join(__dirname, '..', 'docs');

// Function to copy directory recursively
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Move files from docs/browser to docs
if (fs.existsSync(srcDir)) {
  console.log('Moving files from docs/browser to docs...');
  fs.readdirSync(srcDir).forEach((item) => {
    copyRecursiveSync(
      path.join(srcDir, item),
      path.join(destDir, item)
    );
  });
  
  // Remove the browser directory
  fs.rmSync(srcDir, { recursive: true, force: true });
  console.log('✓ Files moved successfully');
} else {
  console.log('No docs/browser directory found, skipping move.');
}

// Add .nojekyll file
const nojekyllPath = path.join(destDir, '.nojekyll');
fs.writeFileSync(nojekyllPath, '');
console.log('✓ .nojekyll file created');

console.log('✓ Export to docs completed!');

