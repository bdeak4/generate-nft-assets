export interface Config {
  symbol: string;
  collectionName: string;
  collectionImagePath: string;
  collectionDescription: string;
  nftNameTemplate: string;
  nftDescriptionTemplate: string;
  imageSize: {
    width: number;
    height: number;
  };
  assetsDir: string;
  count: number;
  fileNameOffset: number;
  nftNameOffset: number;
  traits: {
    name: string;
    path: string;
    values: {
      name: string;
      path: string;
      weight: number;
    }[];
  }[];
}

export interface Metadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  properties: {
    files: {
      uri: string;
      type: string;
    }[];
  };
}
