const withAssetPrefix = (assetPath: string): string => {
  const prefix = typeof __PATH_PREFIX__ !== "undefined" ? __PATH_PREFIX__ : "";

  return `${prefix}${assetPath}`;
};

export default withAssetPrefix;
