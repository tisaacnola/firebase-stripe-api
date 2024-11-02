const express = require("express");
const app = express();
const port = 1337;

//middleware
app.use(express.static("public"));

//routes

app.listen(port, () => console.log(`Server has started on port:${port}`));
