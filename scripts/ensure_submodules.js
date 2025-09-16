const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { version } = require("../package.json");

// Check if the C++ library dependencies exist
if (!fs.existsSync(path.join(__dirname, "../deps/liboqs")) || !fs.existsSync(path.join(__dirname, "../deps/liboqs-cpp"))) {
  try {
    fs.rmdirSync(path.join(__dirname, "../deps"), { recursive: true });
  } catch (e) {
    // Ignore errors if the directory doesn't exist
  }

  // If the temporary source folder doesn't exist, create it
  if (!fs.existsSync(path.join(__dirname, "../gitsource"))) {
    console.log("Cloning fresh copy of liboqs-node source to get submodules...");
    
    // Clone the original repository and its submodules
    execSync(`git clone --depth 1 --recurse-submodules https://github.com/TapuCosmo/liboqs-node.git gitsource`, {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit"
    });

    // Checkout the specific version tag that matches this package
    execSync(`git checkout v${version}`, {
      cwd: path.join(__dirname, "../gitsource"),
      stdio: "inherit"
    });

    // --- START: THE DEFINITIVE FIX ---
    console.log("Patching liboqs build configuration to disable -Werror...");
    const cmakeFilePath = path.join(__dirname, "../gitsource/deps/liboqs/.CMake/compiler_opts.cmake");
    
    // Use 'sed' to comment out the lines that add the -Werror flag.
    // This command works on Linux, which is the Docker environment.
    const sedCommand = `sed -i 's/add_compile_options(-Werror)/#add_compile_options(-Werror)/g' "${cmakeFilePath}"`;
    
    execSync(sedCommand, { stdio: "inherit" });
    console.log("Patching complete.");
    // --- END: THE DEFINITIVE FIX ---
  }

  console.log("Moving patched submodules into place...");
  fs.renameSync(path.join(__dirname, "../gitsource/deps"), path.join(__dirname, "../deps"));

  try {
    fs.rmdirSync(path.join(__dirname, "../gitsource"), { recursive: true });
  } catch (e) {
    // Ignore errors
  }
}