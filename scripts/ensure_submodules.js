const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { version } = require("../package.json");

if (!fs.existsSync(path.join(__dirname, "../deps/liboqs")) || !fs.existsSync(path.join(__dirname, "../deps/liboqs-cpp"))) {
  try {
    fs.rmdirSync(path.join(__dirname, "../deps"), {
      recursive: true
    });
  } catch (e) {}
  if (!fs.existsSync(path.join(__dirname, "../gitsource"))) {
    // --- START: THIS IS THE FIX ---

    // 1. Clone the repository without specifying a branch
    execSync(`git clone --depth 1 --recurse-submodules https://github.com/TapuCosmo/liboqs-node.git gitsource`, {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit"
    });

    // 2. Checkout the specific version tag from within the cloned directory
    execSync(`git checkout v${version}`, {
      cwd: path.join(__dirname, "../gitsource"),
      stdio: "inherit"
    });

    // --- END: THIS IS THE FIX ---
  }
  fs.renameSync(path.join(__dirname, "../gitsource/deps"), path.join(__dirname, "../deps"));
  try {
    fs.rmdirSync(path.join(__dirname, "../gitsource"), {
      recursive: true
    });
  } catch (e) {}
}