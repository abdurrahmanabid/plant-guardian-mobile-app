import Background from "@/components/Background";
import Login from "@/components/Login";
import { SafeAreaView } from "react-native";

const index = () => {
  return (
    <>
      <Background>
        <SafeAreaView className="flex-1 justify-center items-center min-h-screen">
          <Login/>
        </SafeAreaView>
      </Background>
    </>
  );
};

export default index;
