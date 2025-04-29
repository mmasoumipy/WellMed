// const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

// /**
//  * Metro configuration
//  * https://reactnative.dev/docs/metro
//  *
//  * @type {import('@react-native/metro-config').MetroConfig}
//  */
// const config = {};

// module.exports = mergeConfig(getDefaultConfig(__dirname), config);


const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'mp4', 'ttf', 'otf', 'woff', 'woff2', 'mp3', 'wav', 'obj', 'mtl', 'glb', 'gltf'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
