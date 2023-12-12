import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';



const db = SQLite.openDatabase("dados.db");

const InsertScreen = () => {
    const [dados, setDados] = React.useState([]);
    const [refresh, setRefresh] = useState(false);
    
    

    useFocusEffect(
        useCallback(() => {
            db.transaction(tx => {
                tx.executeSql('SELECT * FROM viagem', [], (_, { rows: { _array } }) => {
                    setDados(_array);
                });
            });
        }, [])
    );

    const dataHora = (agora) => {
        const data = new Date(parseInt(agora));
        const opcoes = { timeZone: 'America/Sao_Paulo', hour12: false };
        const dataHoraBrasil = data.toLocaleString('pt-BR', opcoes);

        return dataHoraBrasil;

    };

    const handleLongPress = (id) => {
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
                 
                    },
                },
            ],
            { cancelable: false }
        );
    };
    
      // Excluir um item do SQLite
      const removeById = (id) => {
        db.transaction(tx => {
          tx.executeSql('DELETE FROM viagem WHERE id = ?', [id], () => {
            setRefresh(!refresh);// Atualizar a FlatList
          });
        });
      };


    return (

        <FlatList
            data={dados}
            extraData={refresh}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) =>
                <TouchableOpacity onLongPress={() => handleLongPress(item.id)}>
                    <View style={styles.card}>
                        <Text>{item.nome}</Text>
                        <Text>{dataHora(item.datainicio)}</Text>
                    </View>
                </TouchableOpacity>

            }
        />

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
});