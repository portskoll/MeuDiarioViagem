import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import InsertScreen from './screens/ListaViagens.js';
import Tela2 from './screens/ListaFotos';
import { Text, View, StyleSheet, Image, TouchableOpacity, SafeAreaView, Button } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { init, getDatabaseConnection } from './dados/database.js';
import AbaContext from './screens/AbaContext';
import { Title } from 'react-native-paper';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


export default function App() {
  const [total, setTotal] = useState(0);



  useEffect(() => {
    init()
      .then(() => {
        console.log('Tabela criada ou já existia.');
        const db = getDatabaseConnection();
        // Agora você pode usar 'db' para executar transações
      })
      .catch(err => {
        console.log('Falha ao criar a tabela.');
        console.log(err);
      });
  }, []);




  const apagaTabela = () => {
    db.transaction(tx => {
      tx.executeSql('DROP TABLE IF EXISTS viagem');
      tx.executeSql('DROP TABLE IF EXISTS foto');
    });
  }

  function TabNavigator() {
    const [abaAtual, setAbaAtual] = useState(0);

    return (
      <AbaContext.Provider value={{ abaAtual, setAbaAtual }}>
        <Tab.Navigator>
          <Tab.Screen name='aba1' options={{
            tabBarLabel: 'Todas Viagens', title: 'Todas as Viagens',
            tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="airplane" size={24} color={color} />)
          }}
            component={InsertScreen} listeners={{
              focus: () => setAbaAtual(-1),
            }} />
          <Tab.Screen name='aba2' options={{
            tabBarLabel: 'Viagens Abertas', title: 'Viagens Abertas',
            tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="airplane-cog" size={24} color={color} />)
          }}
            component={InsertScreen} listeners={{
              focus: () => setAbaAtual(0),
            }} />
          <Tab.Screen name='aba3' options={{
          tabBarLabel: 'Viagens Terminadas', title: 'Viagens Terminadas',
          tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="airplane-check" size={24} color={color} />)
        }} 
        component={InsertScreen} listeners={{
            focus: () => setAbaAtual(1),
          }} />
        </Tab.Navigator>
      </AbaContext.Provider>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={TabNavigator} />
        <Stack.Screen name="Tela2" options={{title : 'Fotos da Viagem'}} component={Tela2} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: .1,
    backgroundColor: 'white',
    borderTopColor: 'gray',
    borderTopWidth: 1,
    padding: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  touchableOpacityStyle: {
    position: 'absolute',
    width: 30,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',

  },
  floatingButtonStyle: {
    resizeMode: 'contain',
    width: 50,
    height: 50,
  },
});
