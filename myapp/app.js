const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3005;
const { body, validationResult } = require('express-validator');
app.use(express.json());

const todos = [
    {
        id: 1, title: "Aprender Express.js", completed: false
    },
    {
        id: 2, title: "Revisar middleware", completed: true
    }
];

const loggingMiddleware = (req, res, next) => {
    const logFolder = 'logs';
    const logFile = `${new Date().toISOString().split('T')[0]}.log`; 
    const logPath = path.join(logFolder, logFile);
    const logMessage = `${new Date().toISOString()} - ${req.method} - ${req.url}\n`;

    if (!fs.existsSync(logFolder)) {
        fs.mkdirSync(logFolder);
    }

    fs.appendFileSync(logPath, logMessage, (err) => {
        if (err) {
            console.error('Error typing in log file:', err);
        }
    });

    console.log(logMessage);
    next();
};

app.use(loggingMiddleware);

app.get("/", (req, res) => {
    res.status(201).send({ msg: "Hello" });
});

app.get('/todos', (req, res) => {
    res.status(201).send(todos);
});

app.post('/todos', body('title').notEmpty().withMessage('Title cannot be empty'), (req, res) => 
    { 
       const errors = validationResult(req);
       if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }
       const { body } = req; 
       const newTodo = { id: todos.length ? todos[todos.length - 1].id + 1 : 1, ...body, completed: false };
       todos.push(newTodo); res.status(201).send(newTodo);
 });

app.put('/todos/:id', body('completed').isBoolean().withMessage('Completed must be a boolean'), (req, res) =>
    {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }
    const { body, params: { id } } = req;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return res.sendStatus(400);
    const findTodoIndex = todos.findIndex((todo) => todo.id === parsedId);
    if (findTodoIndex === -1) return res.status(404).json({ error: 'Todo not found' });
    todos[findTodoIndex] = { ...todos[findTodoIndex], completed: body.completed };
    return res.status(200).json(todos[findTodoIndex]); 
}); 
app.delete('/todos/:id', (req, res) => 
{
    const { params: { id } } = req; const parsedId = parseInt(id);
    if (isNaN(parsedId)) return res.sendStatus(400);
    const findTodoIndex = todos.findIndex((todo) => todo.id === parsedId);
    if (findTodoIndex === -1) return res.status(404).json({ error: 'Todo not found' });
    todos.splice(findTodoIndex, 1);
    const message = { message: "Tarea eliminada" }; 
    return res.status(200).send(message);
   });

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
