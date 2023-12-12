import Dialog from "react-native-dialog";
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, TextInput, Text, Button, FlatList, TouchableOpacity, Alert, StyleSheet, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';
import AbaContext from './AbaContext';
import CadastroViagem from "./CadastroViagem";
import PinDialog from "./VerificaPin";


const db = SQLite.openDatabase("dados.db");

const InsertScreen = () => {
    const { abaAtual } = useContext(AbaContext);
    const [dados, setDados] = React.useState([]);
    const [textNomeViagem, setTextNomeViagem] = useState('');
    const [visible, setVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const navigation = useNavigation();

    //verifica Pin
    const [autorizado, setAutorizado] = useState(false);
    const [isPinDialogVisible, setIsPinDialogVisible] = useState(false);

    const checkPin = (pin) => {
        if (pin === '1234') {
            setAutorizado(true);
            ToastAndroid.show('Acesso Autorizado!', ToastAndroid.LONG);
        } else {
            Alert.alert('Erro', 'PIN incorreto.');
        }
        setIsPinDialogVisible(false);
    };


    const showDialog = () => {
        setVisible(true);
    };

    const handleCancel = () => {
        setVisible(false);
    };



    useFocusEffect(
        useCallback(() => {
            //console.log(abaAtual);
            db.transaction(tx => {
                if (abaAtual === 0) {
                    // Se datafim = 0
                    tx.executeSql('SELECT * FROM viagem WHERE datafim = 0 ORDER BY datainicio DESC', [], (_, { rows: { _array } }) => {
                        setDados(_array);
                    });
                } else if (abaAtual === 1) {
                    // Se datafim > 0
                    tx.executeSql('SELECT * FROM viagem WHERE datafim > 0 ORDER BY datainicio DESC', [], (_, { rows: { _array } }) => {
                        setDados(_array);
                    });
                } else {
                    // Se datafim = 0 ou datafim > 0
                    tx.executeSql('SELECT * FROM viagem ORDER BY datainicio DESC', [], (_, { rows: { _array } }) => {
                        setDados(_array);
                    });
                }
            });
        }, [abaAtual])
    );


    const handleLongPress = (id) => {
        if (autorizado) {
            Alert.alert(
                'Excluir item',
                'Tem certeza que deseja excluir este item?',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                    },
                    {
                        text: 'Excluir',
                        onPress: () => {
                            removeById(id);
                            const newData = [...dados];
                            const index = newData.findIndex((item) => item.id === id);
                            newData.splice(index, 1);
                            setDados(newData);
                        },
                    },
                ],
                { cancelable: false }
            );
        }else{
            setIsPinDialogVisible(true);
        }

    };

    const removeById = (id) => {
        db.transaction((tx) => {
            tx.executeSql('DELETE FROM viagem WHERE id = ?', [id]);
            setAutorizado(false);
        });

    };

    const dataHora = (agora) => {
        const data = new Date(parseInt(agora));
        const opcoes = { timeZone: 'America/Sao_Paulo', hour12: false };
        const dataHoraBrasil = data.toLocaleString('pt-BR', opcoes);

        return dataHoraBrasil;

    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setTextNomeViagem(item.nome);
        if (autorizado) {
            showDialog();
        } else {
            setIsPinDialogVisible(true);
        }

    };

    const handleUpdate = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE viagem SET nome = ? WHERE id = ?',
                [textNomeViagem, selectedItem.id]
            );
            setAutorizado(false);
        });
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM viagem',
                [],
                (_, { rows: { _array } }) => setDados(_array),
                (_, error) => console.log(error)
            );
        });
        setSelectedItem(null);
        setTextNomeViagem('');
        setVisible(false);
    };




    return (
        <View >
            <CadastroViagem></CadastroViagem>
            <Dialog.Container visible={visible}>
                <Dialog.Title>Update da Viagem</Dialog.Title>
                <Dialog.Description>
                    Faça suas alterações abaixo:
                </Dialog.Description>
                <Dialog.Input value={textNomeViagem}
                    onChangeText={(textNomeViagem) => setTextNomeViagem(textNomeViagem)} />
                <Dialog.Button label="Cancelar" onPress={handleCancel} />
                <Dialog.Button label="Confirmar" onPress={handleUpdate} />
            </Dialog.Container>
            <PinDialog isVisible={isPinDialogVisible} onCheckPin={checkPin} onClose={() => setIsPinDialogVisible(false)} />
            <FlatList
                data={dados}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) =>
                    <View style={styles.card}>
                        <TouchableOpacity

                            style={{ color: '#3b5998', alignSelf: 'flex-end' }}
                            onPress={() => handleEdit(item)}>
                            <Icon
                                name="edit"
                                size={20}
                                color="gray"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onLongPress={() => handleLongPress(item.id)}
                            onPress={() => {
                                navigation.navigate('Tela2', {
                                    id: item.id,
                                    nome: item.nome,
                                    dataInicial: `Inicio: ${dataHora(item.datainicio)}`,
                                    dataFinal: `Status: ${item.datafim > 0 ? 'Fechada em: ' + dataHora(item.datafim) : 'Aberta'}`
                                });
                            }}>
                            <View >
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.nome}</Text>
                                <Text>{`Inicio: ${dataHora(item.datainicio)}`}</Text>
                                <Text style={{ color: Number(item.datafim) === 0 ? '#3b5998' : 'black' }}>
                                    {Number(item.datafim) === 0 ? 'Viagem Aberta' : `Final : ${dataHora(item.datafim)}`}
                                </Text>



                            </View>
                        </TouchableOpacity>
                    </View>
                }
                ListHeaderComponent={<View style={{ height: 10 }} />} // Adicione esta linha
                ListFooterComponent={<View style={{ height: 100 }} />} // Adicione esta linha
            />
        </View>
    );
};

export default InsertScreen;

const styles = StyleSheet.create({
    card: {
        flex: 1,
        alignSelf: 'stretch',
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 10,
        margin: 2,
    },
    card2: {
        flex: 1,
        alignSelf: 'stretch',
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        flexDirection: 'column',
        justifyContent: 'space-between',
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 10,
        margin: 2,
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    espaco: {

        paddingBottom: 50,
    },
    //tipo fabebook
    button: {
        backgroundColor: '#4267B2',
        padding: 10,
        borderRadius: 4,
        alignItems: 'center',
        marginVertical: 2,
        marginHorizontal: 4
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});