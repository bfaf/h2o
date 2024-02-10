import AsyncStorage from "@react-native-async-storage/async-storage";
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";

export const getCurrentDate = (): string => {
    const today = new Date();
    const month = today.getMonth() < 10 ? `0${today.getMonth()}` : today.getMonth();
    return `${today.getFullYear()}${month}${today.getDate()}`;
};

export const calculateIncrease = (value: number, desiredDailyConsumption: number, currentlyConsumedWater: number): number => {
    const totalHeight = 200;
    let calculated = ((value / desiredDailyConsumption) * totalHeight);
    if (value < 0) {
        calculated = ((value + currentlyConsumedWater) / (desiredDailyConsumption + (value * -1))) * totalHeight;
    } else {
        calculated = ((value + currentlyConsumedWater) / desiredDailyConsumption) * totalHeight;
    }

    if (calculated < 0) {
        return 0;
    }
    const waterLevel = totalHeight - calculated;
    if (waterLevel < 0) {
        return 0;
    } else {
        return waterLevel;
    }
}

export const shouldReset = (currentDate: string, today: string): boolean => {
    if (today.length > 0 && currentDate.length > 0 && today !== currentDate) {
        return true;
    }

    return false;
};

export const shouldAddCoffee = (notifId: string | undefined): boolean => {
    const num = parseInt(notifId || '0');
    return isNaN(num);
};

export const biometricsLogin = async () => {
    const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true })
    const { available, biometryType } = await rnBiometrics.isSensorAvailable()
    if (available) {
        if (biometryType === BiometryTypes.TouchID) {
            let { success, error } = await rnBiometrics.simplePrompt({
                promptMessage: 'Sign in with TouchID or PIN',
                cancelButtonText: 'Close',
            });
            return { success, error };
        } else if (biometryType === BiometryTypes.Biometrics) {
            let { success, error } = await rnBiometrics.simplePrompt({
                promptMessage: 'Sign in with fingerprint or PIN',
                cancelButtonText: 'Close',
            });
            return { success, error };
        } else if (biometryType === BiometryTypes.FaceID) {
            let userId = await AsyncStorage.getItem('USER_ID');
            if (userId == null) {
                userId = 'some-user-id-for-this-device';
                await AsyncStorage.setItem('USER_ID', 'some-user-id-for-this-device');
                const { publicKey } = await rnBiometrics.createKeys();
                await AsyncStorage.setItem('FACE_ID_KEY', publicKey);
                console.log('KRASIII publicKey', publicKey);
            }

            const timestamp = Math.round(
                new Date().getTime() / 1000,
            ).toString();
            const payload = `${userId}__${timestamp}`;
            const { success, signature } = await rnBiometrics.createSignature(
                {
                    promptMessage: 'Sign in',
                    payload,
                },
            );
            console.log('KRASIII signature', signature);
            
        }
    }
}
