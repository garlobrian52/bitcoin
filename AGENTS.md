## Cursor Cloud specific instructions

### Overview

This is **Bitcoin Core**, the reference implementation of the Bitcoin protocol. It is a C++20 project built with CMake. There is no package manager lockfile—all dependencies are system packages.

### Build (headless, no GUI)

```bash
cmake -B build -DENABLE_IPC=OFF -DBUILD_GUI=OFF \
  -DCMAKE_C_COMPILER=gcc -DCMAKE_CXX_COMPILER=g++ \
  -DCMAKE_C_COMPILER_LAUNCHER=ccache -DCMAKE_CXX_COMPILER_LAUNCHER=ccache
cmake --build build -j$(nproc)
```

### Gotchas

- The default `c++` alternative on this VM points to Clang, which fails to link because it cannot find `-lstdc++`. Always pass `-DCMAKE_CXX_COMPILER=g++` (and `-DCMAKE_C_COMPILER=gcc`) to CMake.
- Use `ccache` for faster rebuilds; it is installed by the update script.
- IPC (`-DENABLE_IPC=ON`) requires `libcapnp-dev` / `capnproto`, which are not installed by default. Pass `-DENABLE_IPC=OFF` unless you specifically need multiprocess support.
- GUI (`-DBUILD_GUI=ON`) requires Qt 6 packages, which are not installed. Pass `-DBUILD_GUI=OFF` for headless builds.

### Testing

- **Unit tests:** `ctest --test-dir build -j$(nproc)` (runs all Boost.Test suites via CTest)
- **Functional tests:** `python3 build/test/functional/test_runner.py --jobs 4` (Python-based integration tests; see `test/functional/` for individual test scripts)
- **Lint:** `cd test/lint/test_runner && cargo run` (Rust-based lint runner; optional linters like `ruff`, `shellcheck`, and `mlc` are not pre-installed)

### Running bitcoind

Use regtest mode for local development and testing:

```bash
build/bin/bitcoind -regtest -datadir=/tmp/btc-dev -daemon -rpcuser=test -rpcpassword=test123
build/bin/bitcoin-cli -regtest -datadir=/tmp/btc-dev -rpcuser=test -rpcpassword=test123 <command>
build/bin/bitcoin-cli -regtest -datadir=/tmp/btc-dev -rpcuser=test -rpcpassword=test123 stop
```

### Key directories

- `src/` — All C++ source code
- `test/functional/` — Python functional/integration tests
- `test/lint/` — Lint runner (Rust + scripts)
- `doc/` — Documentation including `build-unix.md`
