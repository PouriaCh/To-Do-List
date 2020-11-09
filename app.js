const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
const port = 3000;

//#########################################################

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set("view engine", "ejs");

//#########################################################

app.listen(port, function() {
  console.log("Server is running on port " + port);
});

//#########################################################

// connect to mongoose with warning handling
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
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

// lists schema and model
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
const List = mongoose.model("List", listSchema);


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

// dynamic route
app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // load an existing list
        res.render("list", {
          listTitle: foundList.name,
          newItems: foundList.items
        });
      }
    }
  });
});

// /about route
app.get("/about", (req, res) => {
  res.render("about");
});

//#########################################################

app.post("/", (req, res) => {
  const listName = req.body.list;
  const inputData = req.body.inputData;
  const inputItem = new Item({
    name: inputData
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(inputItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

// delete items from individual lists
app.post("/delete", function(req, res) {
  const itemID = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndDelete(itemID, function(err) {
      if (!err) {
        console.log("Item deleted from DB.");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: itemID
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }
});
