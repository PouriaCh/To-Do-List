const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

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

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//#########################################################

// items schema and model
const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);

// default items in each new list
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];



//#########################################################

// root route
app.get("/", (req, res) => {
  Item.find({}, function(err, foundItems) {
    if (!foundItems.length) {
      console.log("length is " + foundItems.length);
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added the default items!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newItems: foundItems
      });
    }
  });
});

// /work route
app.get("/work", (req, res) => {
  res.render("list", {
    listTitle: "Work List",
    newItems: workItems
  });
});

// /about route
app.get("/about", (req, res) => {
  res.render("about");
});

//#########################################################

app.post("/", (req, res) => {
  //const currentPage = req.body.list;
  const inputData = req.body.inputData;
  console.log(inputData);
  const inputItem = new Item({
    name: inputData
  });
  inputItem.save();
  res.redirect("/");
});

app.post("/delete", function(req,res){
  const itemID = req.body.checkbox;
  Item.findByIdAndDelete(itemID, function(err){
    if (!err) {
      console.log("Item deleted from DB.");
    }
  });
  res.redirect("/");
});

//#########################################################
