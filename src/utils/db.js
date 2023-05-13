/* istanbul ignore file */

import mongoose from 'mongoose'
import {MongoMemoryServer} from 'mongodb-memory-server'

import config from '../config/index.js'
import logger from './logger.js'

mongoose.Promise = global.Promise;
mongoose.set('debug', process.env.DEBUG !== undefined)

const opts = {
    autoIndex: config.mongo.autoIndex,
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
}

class MongoConnection {
    static #_instance;
    
    #_mongoServer;
  
    static getInstance() {
      if (!MongoConnection.#_instance) {
        MongoConnection.#_instance = new MongoConnection()
      }
      return MongoConnection.#_instance
    }
  
    async open() {
      try {
        if (config.mongo.url === 'inmemory') {
          logger.debug('connecting to inmemory mongo db')
          this.#_mongoServer = await MongoMemoryServer.create();
          const mongoUrl = await this.#_mongoServer.getUri();
          await mongoose.connect(mongoUrl, opts)
        } else {
          logger.debug('connecting to mongo db: ' + config.mongo.url)
          mongoose.connect(config.mongo.url, opts)
        }
  
        mongoose.connection.on('connected', () => {
          logger.info('connecting to mongo db: ' + config.mongo.url)
          logger.info('Mongo: connected')
        })
  
        mongoose.connection.on('disconnected', () => {
          logger.error('Mongo: disconnected')
        })
  
        mongoose.connection.on('error', (err) => {
          logger.error(`Mongo:  ${String(err)}`)
          if (err.name === "MongoNetworkError") {
            setTimeout(function() {
              mongoose.connect(config.mongo.url, opts).catch(() => { })
            }, 5000)
          }
        })
      } catch (err) {
        logger.error(`db.open: ${err}`)
        throw err
      }
    }
  
     async close() {
      try {
        await  mongoose.disconnect()
        if (config.mongo.url === 'inmemory') {
          await this.#_mongoServer?.stop()
        }
      } catch (err) {
        logger.error(`db.open: ${err}`)
        throw err
      }
    }
  }
  
export default MongoConnection.getInstance()