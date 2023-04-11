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
  offset: number;
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
