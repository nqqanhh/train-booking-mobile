// src/polyfills/linkingPatch.ts
import { Linking as RNLinking } from 'react-native';
import * as ExpoLinking from 'expo-linking';

// 🔹 Patch cho expo-linking: thêm getLinkingURL nếu không có
if (!(ExpoLinking as any).getLinkingURL) {
  (ExpoLinking as any).getLinkingURL = (...args: any[]) => {
    // createURL là API chuẩn của expo-linking, dùng để tạo deep link
    return ExpoLinking.createURL(...args);
  };
}

// 🔹 Patch thêm cho React Native Linking (phòng trường hợp lib dùng cái này)
if (!(RNLinking as any).getLinkingURL) {
  (RNLinking as any).getLinkingURL = () => {
    // getInitialURL là API chuẩn, trả về URL dùng để mở app
    return RNLinking.getInitialURL ? RNLinking.getInitialURL() : Promise.resolve(null);
  };
}
