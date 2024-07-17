"use strict";
/* istanbul ignore file */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // read ".env"
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
//import app from "./app";
const logger_1 = require("./logger");
const promises_1 = require("fs/promises");
const https_1 = __importDefault(require("https"));
const websockets_1 = require("./websockets");
// New addidtions
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
// import app from "./app"
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    credentials: true,
    // origin: "*"
}));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json());
const server = http_1.default.createServer(app);
const testPort = parseInt(process.env.HTTP_PORT);
(0, websockets_1.startWebSocketConnection)(server);
server.listen(testPort, () => {
    console.log("Server running on http://localhost:" + testPort + "/");
});
// Set up MOngoDB URL
// const MONGO_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=OceanCombat`;
// Initiate Mongoose
//mongoose.Promise = Promise;
//mongoose.connect(MONGO_URL);
//mongoose.connection.on("error", (error: Error) => console.log(error));
/**
 * Init setup to connect to MongoDB
 * */
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=OceanCombat`;
/**
 * Test .env values
 */
// console.log("Username: " + process.env.MONGO_USER)
// console.log("PW: " + process.env.MONGO_PW)
// console.log("Cluster: " + process.env.MONGO_CLUSTER)
//Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
    //tls: true  // Etablishes TLS connection
});
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        // Tests if env variables could get read
        let mongodURI = uri;
        logger_1.logger.info(`Connect to mongod at ${mongodURI}`);
        if (!mongodURI) {
            logger_1.logger.error(`Cannot start, no database configured. Set environment variable DB_CONNECTION_STRING. Use "memory" for MongoMemoryServer, anything else for real MongoDB server"`);
            process.exit(1);
        }
        if (mongodURI === "memory") {
            logger_1.logger.info("Start MongoMemoryServer");
            const MMS = yield import('mongodb-memory-server');
            const mongo = yield MMS.MongoMemoryServer.create();
            mongodURI = mongo.getUri();
            logger_1.logger.info(`Connect to mongod at ${mongodURI}`);
            yield mongoose_1.default.connect(mongodURI);
            const shouldSSL = process.env.USE_SSL === "true";
            if (shouldSSL) {
                const [privateKey, publicSSLCert] = yield Promise.all([
                    (0, promises_1.readFile)(process.env.SSL_KEY_FILE),
                    (0, promises_1.readFile)(process.env.SSL_CRT_FILE)
                ]);
                const httpsServer = https_1.default.createServer({ key: privateKey, cert: publicSSLCert }, app);
                const HTTPS_PORT = parseInt(process.env.HTTPS_PORT);
                httpsServer.listen(HTTPS_PORT, () => {
                    console.log(`Listening for HTTPS at https://localhost:${HTTPS_PORT}`);
                });
            }
            else {
                const port = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 3000;
                const httpServer = http_1.default.createServer(app);
                (0, websockets_1.startWebSocketConnection)(httpServer);
                console.log("HTTP websocket started");
                httpServer.listen(port, () => {
                    logger_1.logger.info(`Listening for HTTP at http://localhost:${port}`);
                });
            }
        }
        else {
            try {
                // Connect the client to the server	(optional starting in v4.7)
                yield client.connect();
                console.log("Connection successfully etablished!");
                // Send a ping to confirm a successful connection
                yield client.db("BitBusters").command({ ping: 1 });
                console.log("Pinged your deployment. You successfully connected to MongoDB!");
            }
            finally {
                // Ensures that the client will close when you finish/error
                yield client.close();
            }
        }
        try {
            //getACollection(); 
            //hostOnlineMatch();
            //createUser();
            // let user: string = "jane@abc.com";
            // let result = await getUserByMail(user);
            //console.log("Found user: " + JSON.stringify(result));
            // Write user
            // let jane: UserResource = {
            //   email: "jane@abc.com",
            //   password: "jane@abc.com1324",
            //   username: "Jane Doe",
            //   points: 26,
            //   level: 4,
            //   higherLvlChallenge: true
            // }
            // await registerUser(jane);
            // Delete user
            // await deleteUserByMail(jane.email!);
            // Host PublicOnlineMatch
            // let publicMatch: OnlineMatchResource = {
            //   roomId: "4444",
            //   privateMatch: false,
            //   gameMap: "BasicMap",
            //   superWeapons: false,
            //   shotTimer: 10,
            //   gameMode: "1vs1",
            //   hostName: "Peter",
            //   players: ["Peter"],
            //   maxPlayers: 4
            // }
            //await hostOnlineMatch(publicMatch);
            // Delete PublicOnlineMatch
            // await deleteOnlineMatch(publicMatch.roomId, publicMatch.privateMatch);
        }
        catch (e) {
            console.log("Error: " + e);
        }
    });
}
;
setup().catch(console.dir);
//# sourceMappingURL=index.js.map