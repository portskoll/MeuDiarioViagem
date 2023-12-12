import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";

export default function Aba3Screen(){
    return(
        <SafeAreaView style={styles.container}>
            <View>
                <Text>Viagens Terminadas</Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    },
    espaco: {
        marginTop: 8
    }
});