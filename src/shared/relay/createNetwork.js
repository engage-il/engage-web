// @flow
import { Network, QueryResponseCache } from 'relay-runtime'
import type { QueryResult, QueryPayload } from 'relay-runtime' // eslint-disable-line
import { getCacheResolver } from './cacheResolvers'
import config from 'shared/config'

export function createNetwork (headers: Object): Network {
  return Network.create(createQuery(headers))
}

// helpers
function asPayload (result: ?QueryResult): ?QueryPayload {
  return result && result.data ? { data: result.data } : null
}

function asResult (payload: ?QueryPayload): ?QueryResult {
  return payload ? { data: payload.data } : null
}

// see: https://facebook.github.io/relay/docs/network-layer.html
// see: https://github.com/facebook/relay/issues/1688#issuecomment-302931855
function createQuery (headers: Object) {
  const cache = new QueryResponseCache({ size: 250, ttl: 60 * 5 * 1000 })

  return async function query (operation, variables): Object {
    // find an applicable stop-gap cache resolver (if any)
    const resolver = getCacheResolver(operation, variables)
    // default to operation name for queryId if nothing matches
    const { name: queryId } = operation

    // first, check the cache for a response
    let payload: ?QueryPayload
    if (resolver) {
      payload = resolver.getCachedResponse(operation, variables, cache)
    } else {
      payload = cache.get(queryId, variables)
    }

    if (payload) {
      return asResult(payload)
    }

    // fetch data from network if missed
    const response = await fetch(config.graphUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        query: operation.text,
        variables
      })
    })

    const result: QueryResult = await response.json()

    // cache response payload if success
    payload = asPayload(result)
    if (payload) {
      if (resolver) {
        resolver.setCachedResponse(operation, variables, payload, cache)
      } else {
        cache.set(queryId, variables, payload)
      }
    }

    return result
  }
}
