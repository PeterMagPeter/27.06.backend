"use strict";
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
/* istanbul ignore file */
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // read ".env"
const http_1 = __importDefault(require("http"));
// import mongoose from 'mongoose';
const logger_1 = require("./logger");
const websockets_1 = require("./websockets");
// New addidtions
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const app_1 = __importDefault(require("./app"));
app_1.default.use((0, cors_1.default)({
    credentials: true,
    // origin: "*"
}));
app_1.default.use((0, compression_1.default)());
app_1.default.use((0, cookie_parser_1.default)());
app_1.default.use(body_parser_1.default.json());
// Initiate Mongoose
//mongoose.Promise = Promise;
//mongoose.connect(MONGO_URL);
//mongoose.connection.on("error", (error: Error) => console.log(error));
/**
 * Init setup to connect to MongoDB
 * */
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=OceanCombat`;
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
        let mongodURI = process.env.DB_CONNECTION_STRING;
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
            // await mongoose.connect(mongodURI);
        }
        else {
            logger_1.logger.info(`Connect to mongod at ${uri}`);
            try {
                // Connect the client to the server	(optional starting in v4.7)
                yield client.connect()
                    .then(() => { logger_1.logger.info("Connection successfully etablished!"); });
                // Send a ping to confirm a successful connection
                yield client.db("BitBusters").command({ ping: 1 })
                    .then(() => { logger_1.logger.info("Pinged your deployment. You successfully connected to MongoDB!"); });
            }
            finally {
                // Ensures that the client will close when you finish/error
                yield client.close();
            }
        }
        const testPort = parseInt(process.env.HTTP_PORT);
        const server = http_1.default.createServer(app_1.default);
        server.listen(testPort || 3001, () => {
            logger_1.logger.info('Server Started PORT ==> ', testPort);
        });
        (0, websockets_1.startWebSocketConnection)(server);
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