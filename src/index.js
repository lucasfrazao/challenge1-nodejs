const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found!" });
  }

  request.username = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username, todos } = request.body;

  users.push({
    id: uuidv4(),
    todos: [],
    name,
    username,
  });

  return response.status(201).send(`User ${name} created!`);
});

app.get("/users", checksExistsUserAccount, (request, response) => {
  return response.status(200).send(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  return response.json(username.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;

  username.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });

  return response.status(201).json("Todo was created successfully!");
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const { username } = request;
  const { todos } = username;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found!" });

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { username } = request;
  const { todos } = username;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found!" });

  todo.done = true;

  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { username } = request;
  const { todos } = username;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) return response.status(404).json({ error: "Todo not found!" });

  todos.splice(todos.indexOf(todo), 1);

  return response.status(204).send();
});

module.exports = app;
