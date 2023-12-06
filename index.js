import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "to_do_list_board",
  password: process.env.POSTGRES_PWD,
  port: 5432,
});
db.connect();

async function getLists() {
  try {
    const result = await db.query("SELECT * FROM lists ORDER BY id ASC");
    return (result.rows);
  } catch (err) {
    console.log(err);
  }
}

async function getItems(listId) {
  try {
    const result = await db.query(
      "SELECT items.id, items.title "+
      "FROM items WHERE items.list_id = $1 ORDER BY items.id ASC",
      [listId]);
    return (result.rows);
  } catch (err) {
    console.log(err);
  }
}

app.get("/", async (req, res) => {
  let lists = await getLists();
  for (let list of lists) {
    list.items = await getItems(list.id);
  }

  res.render("index.ejs", {lists: lists});
});

app.post("/add", async (req, res) => {
  const list = req.body.newList;
  try {
    await db.query("INSERT INTO lists (title) VALUES ($1)", [list]);
  } catch (err) {
    console.log(err);
  }
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const listToUpdateId = req.body.updatedListId;
  const newTitle = req.body.updatedListTitle;
  try {
    await db.query("UPDATE lists SET title = $1 WHERE id = $2", [newTitle, listToUpdateId])
  } catch (err) {
    console.log(err);
  }
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const listToDeleteId = req.body.deleteListId;
  try {
    await db.query("DELETE FROM lists WHERE id = $1", [listToDeleteId])
  } catch (err) {
    console.log(err);
  }
  res.redirect("/");
});

app.post("/add/item", async (req, res) => {
  const item = req.body.newItem;
  const list = req.body.list;
  try {
    await db.query("INSERT INTO items (title, list_id) VALUES ($1, $2)", [item, list]);
  } catch (err) {
    console.log(err);
  }
  res.redirect("/");
});

app.post("/edit/item", async (req, res) => {
  const itemToUpdateId = req.body.updatedItemId;
  const newTitle = req.body.updatedItemTitle;
  try {
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [newTitle, itemToUpdateId])
  } catch (err) {
    console.log(err);
  }
  res.redirect("/");
});

app.post("/delete/item", async (req, res) => {
  const itemToDeleteId = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE id = $1", [itemToDeleteId])
  } catch (err) {
    console.log(err);
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Go to http://localhost:${port}`);
});
