const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js"); //module defined in date.js
const app = express();
const port = 4000;
const newListItems = [];
const workItems = [];
//#########################################################

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set("view engine", "ejs");

//#########################################################

app.listen(port, () => {
  console.log("Server is running on port " + port);
});

//#########################################################

// / route
app.get("/", (req, res) => {
const currentDay = date.getDate();
  res.render("list", {
    listTitle: currentDay,
    newItems: newListItems
  });
});

// /work route
app.get("/work", (req,res)=>{
  res.render("list", {
    listTitle: "Work List",
    newItems: workItems
  });
});

// /about route
app.get("/about", (req,res)=>{
  res.render("about");
});

//#########################################################

app.post("/", (req, res) => {
  const currentPage = req.body.list;
  const data = req.body.inputData;
  if (currentPage === "Work List") {
    workItems.push(data);
    res.redirect("/work");
  }
  else {
    newListItems.push(data);
    res.redirect("/");
  }
});

//#########################################################
