import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveToken(token: string) {
  await AsyncStorage.setItem("userToken", token);
}

export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem("userToken");
}

export async function deleteToken() {
  await AsyncStorage.removeItem("userToken");
}
