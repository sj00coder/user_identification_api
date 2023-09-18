import './pre-start'; // Must be the first import
import logger from 'jet-logger';

import EnvVars from '@src/constants/EnvVars';
import server from './server';
import { AppDataSource } from '@src/db/data-source';

// **** Run **** //

const SERVER_START_MSG =
  'Express server started on port: ' + EnvVars.Port.toString();

server.listen(EnvVars.Port, async () => {
  logger.info(SERVER_START_MSG);
  try {
    await AppDataSource.initialize();
    logger.info('DB has been intialiased !!');
  } catch (e) {
    logger.err(e);
  }
});
