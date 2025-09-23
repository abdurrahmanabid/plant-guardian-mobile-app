import { Modal, Pressable, Text, View } from "react-native";

type ThemedAlertProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
};

export default function ThemedAlert({ visible, title, message, onClose, confirmText = "OK" }: ThemedAlertProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
        <View className="w-11/12 max-w-md rounded-2xl p-5" style={{ backgroundColor: "#0F0D23", borderColor: "#1a1930", borderWidth: 1 }}>
          <Text className="text-white text-lg" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{title}</Text>
          <Text className="text-slate-300 mt-2" style={{ fontFamily: "HindSiliguri_400Regular" }}>{message}</Text>

          <View className="mt-5 flex-row justify-end">
            <Pressable onPress={onClose} className="px-4 py-2 rounded-xl" style={{ backgroundColor: "#A8B5DB" }}>
              <Text className="text-primary" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}


