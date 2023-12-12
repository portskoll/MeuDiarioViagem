import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('dados.db');

export const init = () => {
    return new Promise((resolve, reject) => {
        // Crie as tabelas se elas não existirem
        db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS viagem (
          id INTEGER PRIMARY KEY NOT NULL,
          nome TEXT NOT NULL,
          datainicio TEXT NOT NULL,
          datafim TEXT NOT NULL
      );`
            );
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS foto (
          id INTEGER PRIMARY KEY NOT NULL,
          local_foto TEXT,
          data_foto TEXT,
          midia TEXT,
          descricao BLOB,
          id_viagem INTEGER,
          FOREIGN KEY (id_viagem) REFERENCES viagem(id)
      );`
            );
        });
    });
};

export const getDatabaseConnection = () => {
    return db;
};
