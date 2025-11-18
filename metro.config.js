// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Alias để Metro dùng đúng bản ES module của tslib
const ALIASES = {
  tslib: require.resolve("tslib/tslib.es6.js"),
};

// Giữ lại resolveRequest gốc nếu có
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const mappedName = ALIASES[moduleName] ?? moduleName;

  if (originalResolveRequest) {
    // Nếu expo đã set sẵn resolveRequest thì gọi lại
    return originalResolveRequest(context, mappedName, platform);
  }

  // Nếu không có, dùng hàm mặc định trên context
  return context.resolveRequest(context, mappedName, platform);
};

module.exports = config;
