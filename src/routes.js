import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRouteath } from './utils/build-route-path.js';

import { parseCsv } from './csv/process-csv.js';


const database = new Database()

const getCurrentDateTime = () => {
  return new Date().toISOString();
};


export const routes = [
  {
    method: 'GET',
    path: buildRouteath('/tasks'),
    handler: (req, res) => {
      try {
        const { search } = req.query;
        const tasks = database.select('tasks', search ? { title: search, description: search } : null);
        res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(tasks));
      } catch (error) {
        console.error(error);
        res.writeHead(500).end('Erro interno no servidor.');
      }
    }
  },
  {
    method: 'POST',
    path: buildRouteath('/task'),
    handler: (req, res) => {
      try {
        const { title, description } = req.body;

        if (title === "" || description === "" || !title || !description) {
          res.writeHead(400).end('O corpo da solicitação deve incluir as propriedades "title" e "description".');
          return;
        }

        const task = {
          id: randomUUID(),
          title,
          description,
          completed_at: null,
          created_at: getCurrentDateTime(),
          updated_at: null,
        };
        database.insert('tasks', task);
        res.writeHead(201).end('Tarefa criada com sucesso.');
      } catch (error) {
        console.error(error);
        res.writeHead(500).end('Erro interno no servidor.');
      }
    }
  },
  {
    method: 'PUT',
    path: buildRouteath('/tasks/:id'),
    handler: async (req, res) => {
      try {
        const { id } = req.params;
        const { title, description } = req.body;
  
        if (title === "" || description === "" || !title || !description) {
          res.writeHead(400).end('O corpo da solicitação deve incluir as propriedades "title" e "description".');
          return;
        } else {
          const rowIndex = await database.update('tasks', id, { title, description, updated_at: getCurrentDateTime() });
  
          if (rowIndex < 0) {
            return res.writeHead(404).end('O registo desta tarefa não existe.');
          }
  
          console.log('Atualização bem-sucedida:', { id, title, description });
          return res.writeHead(204).end();
        }
      } catch (error) {
        console.error(error);
        return res.writeHead(500).end('Erro interno no servidor.');
      }
    },
  },
  
  
  {
    method: 'DELETE',
    path: buildRouteath('/tasks/:id'),
    handler: async (req, res) => {
      try {
        const { id } = req.params;
  
        const rowIndex = await database.delete('tasks', id);
        if (rowIndex > -1) {

          return res.writeHead(404).end('O registro desta tarefa não existe.');
        } else {
          
          return res.writeHead(204).end();

        }
          
      } catch (error) {
        console.error(error);
        return res.writeHead(500).end('Erro interno no servidor.');
      }
    },
  },
  
  {
    method: 'PATCH',
    path: buildRouteath('/tasks/:id/complete'),
    handler: async (req, res) => {
      try {
        const { id } = req.params;
        const complete = req.query.completed_at;
  
        if (complete !== 'complete' && complete !== 'null') {
          return res.writeHead(400).end('O parâmetro "completed_at" deve ser "complete" ou "null".');
        } else {
          
          const rowIndex = await database.updateCompletedAt('tasks', id, complete === 'null' ? null : complete);

          if (rowIndex < 0) {
            return res.writeHead(404).end('O registo desta tarefa não existe.');
          }
  
          console.log('Atualização bem-sucedida:');
          return res.writeHead(204).end();
        }
      } catch (error) {
        console.error(error);
        res.writeHead(500).end('Erro interno no servidor.');
      }
    },
  },

  {
    method: 'POST',
    path: buildRouteath('/tasks'),
    handler: async (req, res) => {
      try {

        const csvFileStream = await parseCsv('./data.csv');
        const tasksToAdd = [];

        for await (const task of csvFileStream) {
          const formattedTask = {
            id: task.id || randomUUID(),
            title: task.title,
            description: task.description,
            completed_at: task.completed_at || null,
            created_at: task.created_at || getCurrentDateTime(),
            updated_at: task.updated_at || null,
          };
    
          tasksToAdd.push(formattedTask);
        }

        for (const task of tasksToAdd) {
          database.insert('tasks', task);
        }

        res.writeHead(201).end('Tarefas importadas com sucesso.');
      } catch (error) {
        console.error(error);
        res.writeHead(500).end('Erro interno no servidor.');
      }
    },
  },
  
];
