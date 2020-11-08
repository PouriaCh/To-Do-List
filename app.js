const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
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

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// schema for each item
const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);

// schema for each list
const listsSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
const List = mongoose.model("List", listsSchema);

// default items in list
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

// / route
app.get("/", (req, res) => {
  const currentDay = date.getDate();

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted default items.");
        }
      });
    } else {
      res.render("list", {
        listTitle: currentDay,
        newItems: foundItems
      });
    }
  });
});

// custom route using express route parameters

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;
  List.findOne({name: customListName}, function(err, foundList){
    if (!err && !foundList){
      // create a new list and save it in lists collection
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      // retreive the list contents and show it on the page

      res.render("list", {
        listTitle: foundList.name,
        newItems: foundList.items
      });
    }
  });



});

// /about route
app.get("/about", (req, res) => {
  res.render("about");
});

//#########################################################

app.post("/", (req, res) => {
  const currentList = req.body.list;
  const data = req.body.inputData;
  const newEnteredItem = new Item({
    name: data
  });
  newEnteredItem.save();
  res.redirect("/");

});

app.post("/delete", function(req, res) {
  Item.findByIdAndDelete(req.body.checkbox, function(err) {
    if (!err) {
      console.log("Successfully deleted the selected item!");
      res.redirect("/");
    }
  });
});

//#########################################################
