const express = require("express");
const fs = require("fs")
const users = require("./MOCK_DATA.json")

const app = express();
const PORT = 8000;

//middle ware- Pluggin
app.use(express.urlencoded({ extended: false }))

app.get("/api/users", (req, res) => {
    return res.json(users);
});

app.get("/user", (req, res) => {
    const html = `
    <ul>
       ${users.map((user) => `
        <li>${user.first_name}
        </li>
        `).join("")}
    </ul>
    `;
    res.send(html)
});

app.get("/api/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    return res.json(user);
});

app.post("/api/users", (req, res) => {
    const body = req.body;
    users.push({ ...body, id: users.length + 1 });
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
        return res.json({ status: "sucess", id: users.length })
    })
    //create new user
});

app.patch("/api/users", (req, res) => {
    const { first_name, last_name, email } = req.body;

    fs.readFile("MOCK_DATA.json", "utf8", (err, data) => {
        if (err) {
            console.error("Read error:", err);
            return res.status(500).json({ status: "error", message: "Failed to read file" });
        }

        let users;
        try {
            users = JSON.parse(data);
        } catch (parseErr) {
            console.error("JSON parse error:", parseErr);
            return res.status(500).json({ status: "error", message: "Invalid JSON format" });
        }

        const userIndex = users.findIndex(user => user.id === 1); // 👈 fixed id = 1

        if (userIndex === -1) {
            return res.status(404).json({ status: "error", message: "User with id 1 not found" });
        }

        // 🔁 Update the user data
        if (first_name !== undefined) users[userIndex].first_name = first_name;
        if (last_name !== undefined) users[userIndex].last_name = last_name;
        if (email !== undefined) users[userIndex].email = email;

        fs.writeFile("MOCK_DATA.json", JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Write error:", writeErr);
                return res.status(500).json({ status: "error", message: "Failed to write file" });
            }

            res.json({ status: "success", user: users[userIndex] });
        });
    });
});
//use to edit user;

app.delete("/api/users", (req, res) => {
    return res.json({ status: "pending" }) //use to delete
});


app.listen(PORT, () => console.log(`Server is started at ${PORT}`))
