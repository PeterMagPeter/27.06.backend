import YAML from 'yamljs';
import { join } from 'path';

const swaggerDocument = YAML.load(join(__dirname, '../swagger.yaml'));

export default swaggerDocument;