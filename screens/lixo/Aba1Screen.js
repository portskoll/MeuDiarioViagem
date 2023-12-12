import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";
import InsertScreen from "../ListaViagens";
import CadastroViagem from "../CadastroViagem";

export default function Aba1Screen() {
    return (
<SafeAreaView style={styles.container}>
<CadastroViagem style={styles.floatingButtonStyle} />
  <InsertScreen style={styles.insertScreen} />
 
</SafeAreaView>

    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
    insertScreen: {
      flex: 1,
    },
    bottomView: {
      borderTopColor: 'gray',
      borderTopWidth: 1,
      padding: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    floatingButtonStyle: {
      // Seu estilo para CadastroViagem
    },
  });



