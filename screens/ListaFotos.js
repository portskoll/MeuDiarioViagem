
import Dialog from "react-native-dialog";
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, Image, FlatList, TouchableOpacity, Alert, ToastAndroid } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { IconButton, Colors } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import PinDialog from "./VerificaPin";

const db = SQLite.openDatabase("dados.db");

export default function Tela2({ route }) {


  const [fotoUri, setFotoUri] = useState(null);
  const { id, nome, dataInicial, dataFinal } = route.params;
  const [visible, setVisible] = useState(false);

  const [autorizado, setAutorizado] = useState(false);
  const [isPinDialogVisible, setIsPinDialogVisible] = useState(false);

  //banco de dados tabela foto
  const [dados, setDados] = React.useState([]);
  const [textNomeDoLocal, setTextNomeDoLocal] = useState("");
  const [textDescricaoDoLocal, setTextdescricaoDoLocal] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [alterar, setAlterar] = useState(0);


  const showDialog = () => {
    if (autorizado) {
      setVisible(true);
    } else {
      setIsPinDialogVisible(true);
    }

  };

  const checkPin = (pin) => {
    if (pin === '1234') {
      setAutorizado(true);
      ToastAndroid.show('Acesso Autorizado!', ToastAndroid.LONG);
    } else {
      Alert.alert('Erro', 'PIN incorreto.');
    }
    setIsPinDialogVisible(false);
  };

  const handleCancel = () => {
    setTextNomeDoLocal('');
    setTextdescricaoDoLocal('');
    setFotoUri('');
    setVisible(false);
    setAlterar(0);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setTextNomeDoLocal(item.local_foto);
    setTextdescricaoDoLocal(item.descricao);
    setFotoUri(item.midia);
    setAlterar(1);
    showDialog();
  };







  const handleShare = async (item) => {
    // Converter imagem para Base64
    const base64Image = await FileSystem.readAsStringAsync(item.midia, { encoding: FileSystem.EncodingType.Base64 });

    // Criar um caminho no diretório de cache
    const path = FileSystem.cacheDirectory + item.id + '.jpg';

    // Escrever o arquivo
    await FileSystem.writeAsStringAsync(path, base64Image, { encoding: FileSystem.EncodingType.Base64 });

    // Verificar se o compartilhamento de arquivos é possível
    if (!(await Sharing.isAvailableAsync())) {
      alert("O compartilhamento de arquivos não está disponível nesta plataforma");
      return;
    }

    // Copiar item.local_foto e item.descricao para a área de transferência
    Clipboard.setString(`Local da foto: ${item.local_foto}\nDescrição: ${item.descricao}`);
    ToastAndroid.show('Texto copiado para area de tranferencia', ToastAndroid.LONG);

    // Compartilhar o arquivo
    Sharing.shareAsync(path);
  };






  const handleUpdate = (df) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE foto SET local_foto = ?, data_foto = ?, midia = ?, descricao = ? WHERE id = ?',
        [textNomeDoLocal, df, fotoUri, textDescricaoDoLocal, selectedItem.id],
        (_, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('Update realizado com sucesso');
          } else {
            console.log('Update não realizado');
          }
        },
        (_, error) => console.log('Erro ao realizar update: ', error)
      );
    });
    db.transaction((tx) => {
      const id_ = id; // substitua isso pelo ID que você quer buscar
      db.transaction(tx => {
        tx.executeSql(`SELECT * FROM foto WHERE id_viagem = ?`, [id_], (_, { rows: { _array } }) => {
          setDados(_array);
        });
      });
    });
    setSelectedItem(null);
    handleCancel();
  };



  async function salvarFoto(uri) {
    const agora = Date.now();
    const novoUri = FileSystem.documentDirectory + `foto${agora}.jpg`;
    await FileSystem.moveAsync({
      from: uri,
      to: novoUri,
    });
    console.log(novoUri);
    return novoUri;
  }

  async function selecionarFotoDaGaleria() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      let resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!resultado.canceled) {

        const novoUri = await salvarFoto(resultado.assets[0].uri);
        setFotoUri(novoUri);

        console.log(novoUri);
      }
    } else {
      throw new Error('Permissão de galeria não concedida');
    }
  }

  const dataHora = (agora) => {
    const data = new Date(parseInt(agora));
    const opcoes = { timeZone: 'America/Sao_Paulo', hour12: false };
    const dataHoraBrasil = data.toLocaleString('pt-BR', opcoes);

    return dataHoraBrasil;

  };


  useFocusEffect(
    useCallback(() => {
      console.log(dataFinal);
      const id_ = id; // substitua isso pelo ID que você quer buscar
      db.transaction(tx => {
        tx.executeSql(`SELECT * FROM foto WHERE id_viagem = ? ORDER BY data_foto DESC`, [id_], (_, { rows: { _array } }) => {
          setDados(_array);
        });
      });
    }, [id]) // inclua id nas dependências
  );



  const handleConfirm = () => {
    console.log(alterar);
    // Aqui você pode lidar com o texto inserido
    const agora = Date.now();
    const agoraString = agora.toString();
    console.log(agoraString);
    const data = new Date(agora);
    const opcoes = { timeZone: 'America/Sao_Paulo', hour12: false };
    const dataHoraBrasil = data.toLocaleString('pt-BR', opcoes);
    console.log(dataHoraBrasil);
    if (alterar == 0) {
      handleInsert(agoraString);
    } else {
      handleUpdate(agoraString);
    }

    setVisible(false);
  };

  const handleRemoveById = (id) => {
    db.transaction((tx) => {
      tx.executeSql('DELETE FROM foto WHERE id = ?', [id]);
      setAutorizado(false);

    });

  };


  const handleAlertaContinuarViagem = () => {
    if (autorizado) {
      Alert.alert(
        'Viagem',
        'Tem certeza que deseja reabrir esta viagem ?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Sim',
            onPress: () => {
              db.transaction((tx) => {
              tx.executeSql(
                `UPDATE viagem SET datafim = ? WHERE id = ?`,
                ["0", id],
                (_, resultSet) => {
                  if (resultSet.rowsAffected > 0) {
                    console.log('Update realizado com sucesso');
                  } else {
                    console.log('Update não realizado');
                  }
                },
                (_, error) => console.log('Erro ao realizar update: ', error)
              );
            });
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      setIsPinDialogVisible(true);
    }

  }

  const handleAlertaExcuir = (id) => {
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
              handleRemoveById(id);
              const newData = [...dados];
              const index = newData.findIndex((item) => item.id === id);
              newData.splice(index, 1);
              setDados(newData);

            },
          },
        ],
        { cancelable: false }
      );
    } else {
      setIsPinDialogVisible(true);
    }

  };

  const handleInsert = (df) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO foto (local_foto, data_foto, midia, descricao, id_viagem) VALUES (?, ?, ?, ?, ?)',
        [textNomeDoLocal, df, fotoUri, textDescricaoDoLocal, id],
        (_, result) => {
          console.log('Insert successful');
        },
        (_, error) => {
          console.log('Insert failed', error);
        }
      );
      setTextNomeDoLocal('');
      setTextdescricaoDoLocal('');
      setFotoUri('');
      const id_ = id; // substitua isso pelo ID que você quer buscar
      db.transaction(tx => {
        tx.executeSql(`SELECT * FROM foto WHERE id_viagem = ?`, [id_], (_, { rows: { _array } }) => {
          setDados(_array);
        });
      });
    });
  };

  const handleConfirmarFinalizarData = () => {

    if (autorizado) {
      Alert.alert(
        'Viagem',
        'Tem certeza que deseja finalizar esta viajem ?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Sim',
            onPress: () => {
             handleFinalizarData();

            },
          },
        ],
        { cancelable: false }
      );
    } else {
      setIsPinDialogVisible(true);
    }

  }

  const handleFinalizarData = () => {
    const agora = Date.now();
    const agoraString = agora.toString();
    console.log(agoraString);
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE viagem SET datafim = ? WHERE id = ?`,
        [agoraString, id],
        (_, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('Update realizado com sucesso');
          } else {
            console.log('Update não realizado');
          }
        },
        (_, error) => console.log('Erro ao realizar update: ', error)
      );
    });
  };

  const IconCheck = () => {
    const [iconColor, setIconColor] = useState('#3b5998'); // Inicializa como azul
  
    // Atualiza a cor do ícone quando dataFinal mudar
    useEffect(() => {
      let texto = "Status: Aberta";
      let valor = dataFinal.trim();
      console.log(`${valor.length}`);
      console.log(`${texto.length}`);
      if (texto === valor) {
        setIconColor('#3b5998'); // Azul
      } else {
        setIconColor('red');
      }
    }, [dataFinal]);
  
    return <Icon name="check" size={20} color={iconColor} />;
  };

  return (
    <View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.id}>{id}</Text>
          <Text style={styles.dataFinal}>{dataFinal}</Text>
        </View>
        <Text style={styles.nome}>{nome}</Text>
        <Text>{dataInicial}</Text>
        <TouchableOpacity onPress={handleConfirmarFinalizarData} onLongPress={handleAlertaContinuarViagem} style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          flexDirection: 'row',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: 10,
          padding: 5
        }}>
          <IconCheck></IconCheck>
        </TouchableOpacity>
      </View>
      <View>
      {dataFinal.length <= 14 && (
  <TouchableOpacity style={styles.button} onPress={showDialog}>
    <Text style={styles.buttonText}>ADICIONAR</Text>
  </TouchableOpacity>
)}

        <Dialog.Container visible={visible}>
          <Dialog.Title>{alterar === 1 ? 'Atualizar etapa' : 'Cadastrar mais uma etapa'}</Dialog.Title>
          <TouchableOpacity style={styles.button}>

            {fotoUri && <Image source={{ uri: fotoUri }} style={{ width: '100%', height: 100 }} />}
            <Dialog.Description style={styles.buttonText}>


              <IconButton
                icon="image"
                size={50}
                onPress={selecionarFotoDaGaleria}
              />
            </Dialog.Description>
          </TouchableOpacity>
          <Dialog.Input value={textNomeDoLocal}
            placeholder="Local da foto"
            onChangeText={(textNomeDoLocal) => setTextNomeDoLocal(textNomeDoLocal)} />
          <Dialog.Input value={textDescricaoDoLocal}
            placeholder="Descrição da foto"
            onChangeText={(textDescricaoDoLocal) => setTextdescricaoDoLocal(textDescricaoDoLocal)} />
          <Dialog.Button label="Cancelar" onPress={handleCancel} />
          <Dialog.Button label="Confirmar" onPress={handleConfirm} />
        </Dialog.Container>
        <PinDialog isVisible={isPinDialogVisible} onCheckPin={checkPin} onClose={() => setIsPinDialogVisible(false)} />
      </View>

      <FlatList
        data={dados}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) =>
          <View style={styles.cardItem}>
            <View style={{ position: 'relative' }}>
              <Image
                style={{ width: '100%', height: 200 }}
                source={{ uri: item.midia }}
              />
              <View style={{
                position: 'absolute',
                top: 10,
                right: 10,
                flexDirection: 'row',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                borderRadius: 10,
                padding: 5
              }}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={{ paddingHorizontal: 10 }}>
                  <Icon name="edit" size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleAlertaExcuir(item.id)} style={{ paddingHorizontal: 10 }}>
                  <Icon name="trash" size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleShare(item)} style={{ paddingHorizontal: 10 }}>
                  <Icon name="share" size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.data}>{dataHora(item.data_foto)}</Text>
            <Text style={styles.local}>{item.local_foto}</Text>
            <Text style={styles.descricao}>{item.descricao}</Text>
          </View>

        }
        ListHeaderComponent={<View style={{ height: 20 }} />} // Adicione esta linha
        ListFooterComponent={<View style={{ height: 200 }} />} // Adicione esta linha
      />



    </View>
  );


}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  id: {
    color: 'lightgray',
  },
  dataFinal: {
    color: 'lightgray',
  },
  nome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  //item card
  cardItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 5,

    marginHorizontal: 4,
    overflow: 'hidden',
  },
  data: {
    fontSize: 12,
    color: '#888',
    margin: 2,
    marginLeft: 10,
  },
  local: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 2,
    marginLeft: 10,
  },
  descricao: {
    fontSize: 14,
    margin: 2,
    marginLeft: 10,
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