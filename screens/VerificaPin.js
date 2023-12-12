// PinDialog.js
import React, { useState } from 'react';
import Dialog from "react-native-dialog";

const PinDialog = ({ isVisible, onCheckPin, onClose }) => {
  const [pin, setPin] = useState('');

  const handleCheckPin = () => {
    onCheckPin(pin);
    setPin('');
  };

  const handleClose = () => {
    setPin('');
    onClose();
  };

  return (
    <Dialog.Container visible={isVisible}>
      <Dialog.Title>Insira seu PIN</Dialog.Title>
      <Dialog.Input 
        secureTextEntry
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
      />
      <Dialog.Button label="Cancelar" onPress={handleClose} />
      <Dialog.Button label="Verificar" onPress={handleCheckPin} />
    </Dialog.Container>
  );
};

export default PinDialog;
