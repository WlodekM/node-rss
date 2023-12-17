import { createHash } from 'crypto';
import fs from 'fs'
import JSONdb from "simple-json-db";
import express from "express"

const app = express();
const port = 81;
export const website = (() => {
    app.set('trust proxy', true)
    app.use((req, res, next) => {
        
        // -----------------------------------------------------------------------
        // authentication middleware

        function hashString(inputString) {
            const hash = createHash('sha256');
            hash.update(inputString);
            return hash.digest('hex');
        }

        if (!req.path.startsWith("/api")) {
            console.log(req.path)
            return next()
        }

        function denied() {
            // Access denied...
            res.set('WWW-Authenticate', 'Basic realm="401"') // change this
            res.status(401).send('Authentication required.') // custom message
        }

        const users = new JSONdb("users.json")

        // parse login and password from headers
        const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
        const [login, pass] = Buffer.from(b64auth, 'base64').toString().split(':')

        // Verify login and password are set and correct
        if (!users.has(login)) return denied()
        let hashedPass = hashString(pass)
        if (users.get(login).password != hashedPass) return denied()
        
        // Access granted...
        return next()
        // -----------------------------------------------------------------------

    })
    app.get('/api', (req, res) => {
        res.send('Hello World!, the api is in progress')
    })
    app.get('/', function (req, res) {
        res.send("Hello World!")
    });
    app.get('/rss', function (req, res) {
        res.send(fs.readFileSync("public/rss.xml"))
    });
    app.use(express.static('public'));
    app.listen(port, () => {
        console.log(`The website is up and is on port ${port}`)
        // open("http://localhost:443/", config.settings.browser);
    });
})