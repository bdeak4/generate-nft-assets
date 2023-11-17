# generate-nft-assets

generate nft assets in [sugar](https://github.com/metaplex-foundation/sugar) compatible format

## User Guide

prepare directory with all NFT trait assets, then generate config template:

```
yarn config:generate
```

fill in `config.json`, then run:

```
yarn assets:generate
```

and validate generated assets with:

```
yarn assets:validate
```