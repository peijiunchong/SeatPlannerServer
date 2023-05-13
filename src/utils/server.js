// load openapi.yml
// make express to use API Validator & connect the controllers to corresponding HTTP requests
import config from "../config/index.js";

import express from "express";
import cors from 'cors';
import * as OpenApiValidator from 'express-openapi-validator';
import {connector, summarise} from 'swagger-routes-express';
import YAML from 'yamljs';

import * as api from '../api/controllers/index.js'

import bodyParser from 'body-parser'
import morgan from 'morgan'
import morganBody from 'morgan-body'
import { expressDevLogger } from "./express_dev_logger.js";

import logger from "./logger.js";

export async function createServer() {
    
    const yamlSpecFile = './config/openapi.yml';
    const apiDefinition = YAML.load(yamlSpecFile);
    const apiSummary = summarise(apiDefinition);
    logger.info(apiSummary);

    const server = express();
    // here we can intialize body/cookies parsers, connect logger, for example morgan

    server.use(cors())

    server.use(bodyParser.json())
  
    /* istanbul ignore if */
    if (config.morganLogger) {
      server.use(morgan(':method :url :status :response-time ms - :res[content-length]'))
    }
    
    /* istanbul ignore next */
    if (config.morganBodyLogger) {
      morganBody(server)
    }

    /* istanbul ignore if */
    if (config.exmplDevLogger) {
      server.use(expressDevLogger)
    }

    // setup API validator
    const validatorOptions = {
      apiSpec: yamlSpecFile,
      validateRequests: true,
      validateResponses: true
    }

    // await new OpenApiValidator(validatorOptions).install(server);
    server.use(OpenApiValidator.middleware(validatorOptions));

    server.use((err, req, res, next) => {
      res.status(err.status).json({
        error: {
          type: 'request_validation',
          message: err.message,
          errors: err.errors
        }
      })
    })
   
    const connect = connector(api, apiDefinition, {
      onCreateRoute: (method, descriptor) => {
        descriptor.shift()
        logger.verbose(`${method}: ${descriptor.map((d) => d.name).join(', ')}`)
      },
      security: {
        bearerAuth: api.auth
      }
    })
  
    connect(server)

    return server
}