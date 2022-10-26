import { LogLevelDesc, IListenOptions, Servers } from '@hyperledger/cactus-common'
import { PluginRegistry } from '@hyperledger/cactus-core'
import { Constants } from '@hyperledger/cactus-core-api'
import { PluginLedgerConnectorIroha2, Iroha2BaseConfig } from '@hyperledger/cactus-plugin-ledger-connector-iroha2'

import { crypto } from '@iroha2/crypto-target-node'
import { setCrypto } from '@iroha2/client'

import { v4 as uuid } from 'uuid'
import { Server as SocketIoServer } from 'socket.io'
import http from 'http'
import Express from 'express'
import bodyParser from 'body-parser'
import consola from 'consola'

import CONFIG from '../config.json'

const LOG_LEVEL: LogLevelDesc = 'info'

setCrypto(crypto)

async function start(config: Required<Iroha2BaseConfig>): Promise<{
  stop: () => Promise<void>
}> {
  const connector = new PluginLedgerConnectorIroha2({
    instanceId: uuid(),
    pluginRegistry: new PluginRegistry({ plugins: [] }),
    logLevel: LOG_LEVEL,
    defaultConfig: config,
  })

  // Run http server
  const expressApp = Express()
  expressApp.use(bodyParser.json({ limit: '250mb' }))
  const httpServer = http.createServer(expressApp)
  const listenOptions: IListenOptions = {
    hostname: '127.0.0.1',
    port: 0,
    server: httpServer,
  }
  const addressInfo = await Servers.listen(listenOptions)
  const apiHost = `http://${addressInfo.address}:${addressInfo.port}`

  const socketIoServer = new SocketIoServer(httpServer, {
    path: Constants.SocketIoConnectionPathV1,
  })

  await connector.getOrCreateWebServices()
  await connector.registerWebServices(expressApp, socketIoServer)

  async function stop() {
    await Promise.all([
      new Promise<void>((resolve) => socketIoServer.close(() => resolve())),
      new Promise<void>((resolve) => httpServer.close(() => resolve())),
    ])
  }

  consola.info('Api host: %o', apiHost)

  return { stop }
}

start(CONFIG).catch((err) => {
  consola.fatal(err)
  process.exit(1)
})
