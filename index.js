import logger from "./src/utils/logger.js";
import { createServer } from "./src/utils/server.js";
import db from "./src/utils/db.js";

const port = process.env.PORT || 3000;

db.open()
    .then(() => createServer())
    .then(server => {
        server.listen(port, () => {
            logger.info(`Listening on http://localhost:${port}`)
        })
    })
    .catch(err => {
        logger.error(`Error: ${err}`)
    })