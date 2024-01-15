import fs from 'node:fs/promises';

const databasePath = new URL('db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf8')
    .then(data => {
      this.#database = JSON.parse(data)
    })
    .catch(() => {
      this.#persist()
    })
  }

  async #persist() {
    try {
      await fs.writeFile(databasePath, JSON.stringify(this.#database));
      console.log('Banco de dados persistido com sucesso.');
    } catch (error) {
      console.error('Erro ao persistir o banco de dados:', error);
    }
  }

  select(table, search) {
    try {
      let data = this.#database[table] ?? [];

      if (search) {
        data = data.filter(row => {
          return Object.entries(search).some(([key, value]) => {
            return row[key].toLowerCase().includes(value.toLowerCase());
          });
        });
      }
      return data;
    } catch (error) {
      console.error('Erro ao selecionar dados do banco de dados:', error);
      throw error;
    }
  }

  async insert(table, data) {
    try {
      if (Array.isArray(this.#database[table])) {
        this.#database[table].push(data);
      } else {
        this.#database[table] = [data];
      }

      await this.#persist();

      console.log('Inserção realizada com sucesso.');
      return data;
    } catch (error) {
      console.error('Erro ao inserir dados no banco de dados:', error);
      throw error;
    }
  }

  async update(table, id, data) {
    try {
      const rowIndex = this.#database[table].findIndex(row => row.id === id);

      if (rowIndex > -1) {
        this.#database[table][rowIndex] = {
          ...this.#database[table][rowIndex],
          ...data,
          id,
        };
        await this.#persist();
        console.log('Atualização realizada com sucesso.');
        console.log('Tarefas após a atualização:', this.#database[table]);
        return data;
      }
      return -1;
    } catch (error) {
      console.error('Erro ao atualizar dados no banco de dados:', error);
      throw error;
    }
  }

  async delete(table, id) {
    try {
      const rowIndex = this.#database[table].findIndex(row => row.id === id);

      if (rowIndex > -1) {
        this.#database[table].splice(rowIndex, 1);
        await this.#persist();
        console.log('Exclusão realizada com sucesso.');
      }
    } catch (error) {
      console.error('Erro ao excluir dados do banco de dados:', error);
      throw error;
    }
  }

  async updateCompletedAt(table, id, completed_at) {
    try {
      const rowIndex = this.#database[table].findIndex(row => row.id === id);

      if (rowIndex > -1) {
        this.#database[table][rowIndex].completed_at = completed_at === 'complete' ? 'complete' : null;
        await this.#persist();
        console.log('Atualização de completed_at realizada com sucesso.');
        return completed_at;
      }
    } catch (error) {
      console.error('Erro ao atualizar completed_at no banco de dados:', error);
      throw error;
    }
  }

}