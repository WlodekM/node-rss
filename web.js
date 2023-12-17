import { createHash } from "crypto";
import fs from "fs";
import JSONdb from "simple-json-db";
import express from "express";
import { rssFeed } from "./index.js";
import bodyParser from "body-parser"  // Parse POST request body

const app = express();
const port = 81;
export const website = () => {
    app.set("trust proxy", true);
    app.use((req, res, next) => {
        // -----------------------------------------------------------------------
        // authentication middleware
    
        function hashString(inputString) {
            const hash = createHash("sha256");
            hash.update(inputString);
            return hash.digest("hex");
        }
    
            console.log(`REQ: ${req.path} ${req.url}`);
        if (!req.path.startsWith("/api")) {
            return next();
        }
    
        function denied() {
            // Access denied...
            res.set("WWW-Authenticate", 'Basic realm="401"'); // change this
            res.status(401).send("Authentication required."); // custom message
        }
    
        const users = new JSONdb("users.json");
    
        // parse login and password from headers
        const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
        const [login, pass] = Buffer.from(b64auth, "base64").toString().split(":");
    
        // Verify login and password are set and correct
        if (!users.has(login)) return denied();
        let hashedPass = hashString(pass);
        if (users.get(login).password != hashedPass) return denied();
    
        // Access granted...
        return next();
        // -----------------------------------------------------------------------
    });
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.get("/api", (req, res) => {
        res.send("Hello World!, the api is in progress");
    });
    app.get("/api/post", (req, res) => {
        rssFeed.item({
            title: req.query.title,
            description: req.query.description,
            url: req.query.link,
            guid: req.query.guid,
            date: req.query.pubDate ? req.query.pubDate : null,
            pubDate: new Date()
        });
        const xml = rssFeed.xml({ indent: true });
        fs.writeFileSync("public/rss.xml", xml);
        res.send(200, fs.readFileSync("public/rss.xml"), "xml");;
    });
    app.post("/Papi/post", (req, res) => {
        function hashString(inputString) {
            const hash = createHash("sha256");
            hash.update(inputString);
            return hash.digest("hex");
        }
        const users = new JSONdb("users.json");
        const postData = req.body;
        console.log(JSON.stringify(postData))
        if(!postData.title || !postData.description || !postData.link || !postData.guid || !postData.password) return res.send(400, "Bad request")
        if(!users.has(postData.username)) return res.send(400, "Bad username")
        if(users.get(postData.username).password != hashString(postData.password)) return res.send(400, "Bad password")
        rssFeed.item({
            title: postData.title,
            description: postData.description,
            url: postData.link,
            guid: postData.guid,
            date: postData.pubDate ? postData.pubDate : null,
            pubDate: new Date()
        });
        const xml = rssFeed.xml({ indent: true });
        fs.writeFileSync("public/rss.xml", xml);
        res.send(200, fs.readFileSync("public/rss.xml"), "xml");;
    });
    app.get("/", function (req, res) {
        res.send("Hello World!");
    });
    app.get("/rss", function (req, res) {
        const xml = rssFeed.xml({ indent: true });
        fs.writeFileSync("public/rss.xml", xml);
        res.send(fs.readFileSync("public/rss.xml"));
    });
    app.use(express.static("public"));
    app.listen(port, () => {
        console.log(`The website is up and is on port ${port}`);
        // open("http://localhost:443/", config.settings.browser);
    });
};
