module.exports = {
  testEnvironment: "node",
  preset: 'react-native',
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  setupFiles: ["<rootDir>/utils/jest-setup.js"],
  transformIgnorePatterns: [ 
    "node_modules/(?!(@react-native|react-native|react-native-iphone-x-helper|react-navigation|@react-navigation|react-native-vector-icons)/)"
  ],
};
