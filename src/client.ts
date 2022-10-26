import cac from 'cac'
import {
  BlockTypeV1,
  Iroha2ApiClient,
  IrohaInstruction,
  IrohaQuery,
} from '@hyperledger/cactus-plugin-ledger-connector-iroha2'
import { Configuration } from '@hyperledger/cactus-core-api'
import { VersionedCommittedBlock } from '@iroha2/data-model'
import { match, P } from 'ts-pattern'
import consola from 'consola'

const cli = cac('cactus-client')

cli.command('<apiHost>').action(async (apiHost: string) => {
  const client = new Iroha2ApiClient(new Configuration({ basePath: apiHost }))

  client.watchBlocksV1({ type: BlockTypeV1.Binary }).subscribe({
    next: (event) => {
      match(event)
        .with({ binaryBlock: P.not(P.nullish) }, async ({ binaryBlock }) => {
          const block = VersionedCommittedBlock.fromBuffer(Buffer.from(binaryBlock))

          // ! ADD YOUR BLOCK HANDLING LOGIC HERE

          consola.info('Block with height: %o', block.as('V1').header.height)

          // // you can make a transaction:
          // await client.transactV1({
          //   transaction: {
          //     instruction: { name: IrohaInstruction.MintAsset, params: [] },
          //   },
          // })

          // // and a query:
          // await client.queryV1({
          //   query: {
          //     query: IrohaQuery.FindAllDomains,
          //   },
          // })
        })
        .otherwise((x) => {
          consola.error('Cannot parse block: %o', x)
        })
    },
  })
})

cli.help()

cli.parse()
