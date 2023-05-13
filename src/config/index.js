
import dotenvExtended from 'dotenv-extended'
import dotenvParseVariables from 'dotenv-parse-variables'

const env = dotenvExtended.load({
  path: './config/.env.test',
  defaults: './config/.env.defaults',
  schema: './config/.env.schema',
  includeProcessEnv: true,
  silent: false,
  errorOnMissing: true,
  errorOnExtra: true
})

const parsedEnv = dotenvParseVariables(env);

// interface Config {
//   morganLogger: boolean
//   morganBodyLogger: boolean
//   exmplDevLogger: boolean
// }

const config = {
  mongo: {
    url: parsedEnv.MONGO_URL,
    useCreateIndex: parsedEnv.MONGO_CREATE_INDEX,
    autoIndex: parsedEnv.MONGO_AUTO_INDEX
  },
  morganLogger: parsedEnv.MORGAN_LOGGER,
  morganBodyLogger: parsedEnv.MORGAN_BODY_LOGGER,
  exmplDevLogger: parsedEnv.EXMPL_DEV_LOGGER,
  loggerLevel: parsedEnv.LOGGER_LEVEL,
  privateKeyFile: parsedEnv.PRIVATE_KEY_FILE,
  publicKeyFile: parsedEnv.PUBLIC_KEY_FILE,
}

export default config