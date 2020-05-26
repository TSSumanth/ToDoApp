let express = require('express')
let mongodb = require('mongodb')
let db

let app = express()
app.use(express.static('public'));
let connectionString = 'mongodb://127.0.0.1:27017/toDoAppdb';
mongodb.connect(connectionString, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.log("Error occured: " + err.message)
    }else{
        db = client.db();
        app.listen(3000)
    }
    
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', function (req, res) {
    let arrayitems = []
    db.collection("allTasks").find({deleted:{$ne:"true"}}).toArray((err, items) => {
        res.send(`<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Simple To-Do App</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
        </head>
        <body>
          <div class="container">
            <h1 class="display-4 text-center py-1">To-Do App</h1>
            
            <div class="jumbotron p-3 shadow-sm">
              <form id ="tasksform">
                <div class="d-flex align-items-center">
                  <input id="taskinputfield"  name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                  <button class="btn btn-primary">Add New Item</button>
                </div>
              </form>
            </div>
            
            <ul id="tasklist" class="list-group pb-5">
            ${
            items.map((item) => {
                return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                        <span class="item-text">${item.taskDetails}</span>
                        <div>
                            <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
                            <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
                        </div>
                        </li>`
            }).join('')
            }
            </ul>

            <button id="showDeleted" class="btn btn-primary">Show Deleted Tasks</button> <button id="HideDeleted" class="btn btn-primary" disabled = true>Hide Deleted Tasks</button>
            <br>

          </div>
          
        </body>
        <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
        <script src="browser.js"></script>
        </html>`)
    })
})

app.post('/create-item', function (req, res) {
    db.collection("allTasks").insertOne({ "taskDetails": req.body.text, "taskStatus": "Pending" }, (err,info) => {
        res.json(info.ops[0]);
    })
})

app.post('/update-item', function (req, res) {
    db.collection("allTasks").findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)},{$set: {"taskDetails": req.body.text }}, (err,info) => {
        res.send(info.value);        
    })
})

app.post('/delete-item', function (req, res) {
    // db.collection("allTasks").deleteOne({_id: new mongodb.ObjectId(req.body.id)}, (err,info) => {
    //     res.send(info.deletedCount)
    // })

    db.collection("allTasks").findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)},{$set: {"deleted": "true" }}, () => {
        res.send("Thanks for deleting the task.")
        
    })
}) 

app.get('/show-deleted', function(req,res){
    db.collection("allTasks").find({deleted:{$eq:"true"}}).toArray((err,items) => {
        res.send(items)
    })    
})