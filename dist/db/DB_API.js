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
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const uri = 'mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/test?retryWrites=true&w=majority';
function createRoom(onlinematch) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            yield client.connect();
            const database = client.db('OceanCombat');
            const onlinematchs = database.collection('Onlinematch');
            // Hier können Sie die gewünschte Schreiboperation auswählen, z. B. einfügen, aktualisieren oder löschen.
            // In diesem Beispiel fügen wir ein neues Dokument in die Tabelle "Onlinematch" ein.
            const result = yield onlinematchs.insertOne(onlinematch);
            console.log(`Dokument eingefügt mit dem _id: ${result.insertedId}`);
        }
        catch (error) {
            console.error('Fehler beim Verbinden mit der Datenbank:', error);
        }
        finally {
            yield client.close();
        }
    });
}
//# sourceMappingURL=DB_API.js.map