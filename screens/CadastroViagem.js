import Dialog from "react-native-dialog";
import React, { useState } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Text, ToastAndroid, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import PinDialog from "./VerificaPin";

const db = SQLite.openDatabase("dados.db");


export default function CadastroViagem() {
  const [visible, setVisible] = useState(false);
  const [textNomeViagem, setTextNomeViagem] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [isPinDialogVisible, setIsPinDialogVisible] = useState(false);

  const checkPin = (pin) => {
    if (pin === '1234') {
      setAutorizado(true);
      ToastAndroid.show('Acesso Autorizado!\n Aperte ADICIONAR', ToastAndroid.LONG );
    } else {
      Alert.alert('Erro', 'PIN incorreto.');
    }
    setIsPinDialogVisible(false);
  };


  const showDialog = () => {
    if (autorizado){
      setVisible(true);
    }else{
      setIsPinDialogVisible(true);
    }
    
  };

  const handleCancel = () => {

    setVisible(false);
    
    
    

  };



  const handleConfirm = () => {
    // Aqui você pode lidar com o texto inserido
    console.log(textNomeViagem);
    const agora = Date.now();
    const agoraString = agora.toString();
    console.log(agoraString);
    const data = new Date(agora);
    const opcoes = { timeZone: 'America/Sao_Paulo', hour12: false };
    const dataHoraBrasil = data.toLocaleString('pt-BR', opcoes);
    console.log(dataHoraBrasil);
    handleInsert(agoraString, "0");
    setVisible(false);
  };

  const handleInsert = (di, df) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO viagem (nome, datainicio, datafim) VALUES (?, ?, ?)',
        [textNomeViagem, di, df],
        (_, result) => {
          console.log('Insert successful');
          ToastAndroid.show('Sucesso, alterne entra as abas!', ToastAndroid.SHORT);
        },
        (_, error) => {
          console.log('Insert failed', error);
          ToastAndroid.show(error.toString(), ToastAndroid.LONG);
        }
      );
    });
  };



  return (
    <View>
      
      <TouchableOpacity style={styles.button} onPress={showDialog}>
        <Text style={styles.buttonText}>ADICIONAR</Text>
      </TouchableOpacity>
      <Dialog.Container visible={visible}>
        <Dialog.Title>Cadastrar Nova Viagem</Dialog.Title>
        <Dialog.Description>
          A data do Inicio da viagem será adicionada automáticamente,
          como  data e hora atual e não poderá ser alterada posteriormente!
        </Dialog.Description>
        <Dialog.Input placeholder="Digite o nome e local da viagem" onChangeText={(textNomeViagem) => setTextNomeViagem(textNomeViagem)} />
        <Dialog.Button label="Cancelar" onPress={handleCancel} />
        <Dialog.Button label="Confirmar" onPress={handleConfirm} />
      </Dialog.Container>
      <PinDialog isVisible={isPinDialogVisible} onCheckPin={checkPin} onClose={() => setIsPinDialogVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({

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
