import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

let user_id = [];
 

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "synergy",
    password: "******",
    port:5432,
  });
db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
  

async function getText() {
    const userId = user_id.id;
    const result = await db.query("SELECT text_data FROM data WHERE user_id = $1 ORDER BY data_id ASC", [userId]);
    return result.rows; // Return the array directly
}

app.get("/", (req, res) => {
    res.render("home.ejs");
});


app.get("/submit", async (req, res) => {
    res.render("submit.ejs"); 
});


app.post("/submit",  async (req, res) => {
    const userId = user_id.id
    const secret = req.body.secret
    try {
        await db.query("INSERT INTO data (text_data, user_id) VALUES ($1, $2)", [secret, userId]);
        const texts  = await getText();
        res.render("secrets.ejs",{ user: user_id,  listtexts: texts});
    } catch (err) {
        console.error(err);
    }
});


app.get("/login", (req, res) => {
    res.render("login.ejs");
});


app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const result = await db.query("SELECT * FROM \"user\" WHERE username = $1 AND password = $2", [username, password]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            user_id = user
            console.log(user_id);
            const texts  = await getText();
            res.render("secrets.ejs", { user: user, listtexts: texts });
        } else {
            res.render("home.ejs");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/register", (req, res) => {
    res.render("register.ejs");
});


app.post("/register", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const result  =  await db.query("INSERT INTO \"user\" (username, password) VALUES  ($1 , $2) RETURNING *", [username, password]);
        const user  = result.rows[0];
        user_id = user
        const texts  = await getText();
        res.render("secrets.ejs" , { user: user ,listtexts: texts });
    } catch (err) {
        console.error(err);
    }
});


app.get("/logout", (req, res) => {
    res.render("home.ejs");
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
