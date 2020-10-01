import express from 'express';
import bodyParser from 'body-parser';
import Engine from "./engine.mjs";
import * as readline from "readline";

const app = express()
const port = 3000
var input = {};
var server = app.listen(port, function(){
    console.log(`listening at http://localhost:${port}`);
    Init();
});

const REQTYPE = {
    POST: "post",
    GET: "get"
  };
  
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

app.get('/createnation', async function (req, res) {
    //
});

app.get('/createrank', async function (req, res) {
    //
});

app.get('/createtitle', async function (req, res) {
    //
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())


//controller

// app.get('/', function (req, res) {
// });
async function ProcessCommand(command)
{
    switch (command)
    {
        case "init":
            Engine.Init();
            break;
        default:
            console.log("Nothing was entered.");
            break;
    }
}

async function Query()
{
    input = await WriteLine("Awaiting command: \n");
    ProcessCommand(input);
}

async function WriteLine(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
        setTimeout(()=>{
            Query();
        }, 1000);
    }));
}

async function Init()
{
    // Query();
    Engine.Init();
}