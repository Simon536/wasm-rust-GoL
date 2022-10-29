<div align="center">

## 🚴 Usage

### 🛠️ Build with `wasm-pack build`

```
wasm-pack build
```

### 🔬 Test in Headless Browsers with `wasm-pack test`

```
wasm-pack test --headless --firefox
```

### 🎁 Publish to NPM with `wasm-pack publish`

```
wasm-pack publish
```

### Cloudflare Pages Deployment

```
curl https://sh.rustup.rs -sSf | sh -s -- -y; source "$HOME/.cargo/env"; curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh; wasm-pack build; cd www; npm install; npm run build; cp ./_headers ./dist/_headers;
```
