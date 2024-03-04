/* eslint-disable */
// bundler v0.1.0 6a8e6c701973b3a9746a7307fc8bdb8bf4e7b305
// --
// Code generated by webrpc-gen@v0.14.0-dev with typescript generator. DO NOT EDIT.
//
// webrpc-gen -schema=rpc.ridl -target=typescript -client -out=./clients/proto.gen.ts

// WebRPC description and code-gen version
export const WebRPCVersion = "v1"

// Schema version of your RIDL schema
export const WebRPCSchemaVersion = "v0.1.0"

// Schema hash generated from your RIDL schema
export const WebRPCSchemaHash = "6a8e6c701973b3a9746a7307fc8bdb8bf4e7b305"

//
// Types
//


export enum MessageType {
  DEBUG = 'DEBUG',
  NEW_OPERATION = 'NEW_OPERATION',
  ARCHIVE = 'ARCHIVE'
}

export interface Version {
  webrpcVersion: string
  schemaVersion: string
  schemaHash: string
  nodeVersion: string
}

export interface Status {
  healthOK: boolean
  startTime: string
  uptime: number
  ver: string
  branch: string
  commitHash: string
  hostId: string
  hostAddrs: Array<string>
  priorityPeers: Array<string>
}

export interface Operation {
  entrypoint: string
  callData: string
  gasLimit: string
  feeToken: string
  endorser: string
  endorserCallData: string
  endorserGasLimit: string
  maxFeePerGas: string
  priorityFeePerGas: string
  baseFeeScalingFactor: string
  baseFeeNormalizationFactor: string
  hasUntrustedContext: boolean
  chainId: string
}

export interface Message {
  type: MessageType
  message: any
}

export interface MempoolView {
  size: number
  seenSize: number
  lockSize: number
  seen: Array<string>
  operations: any
}

export interface Operations {
  mempool: Array<string>
  archive: string
}

export interface BaseFeeRate {
  scalingFactor: string
  normalizationFactor: string
}

export interface FeeAsks {
  minBaseFee: string
  minPriorityFee: string
  acceptedTokens: {[key: string]: BaseFeeRate}
}

export interface Bundler {
  ping(headers?: object, signal?: AbortSignal): Promise<PingReturn>
  status(headers?: object, signal?: AbortSignal): Promise<StatusReturn>
  peers(headers?: object, signal?: AbortSignal): Promise<PeersReturn>
  mempool(headers?: object, signal?: AbortSignal): Promise<MempoolReturn>
  sendOperation(args: SendOperationArgs, headers?: object, signal?: AbortSignal): Promise<SendOperationReturn>
  operations(headers?: object, signal?: AbortSignal): Promise<OperationsReturn>
  feeAsks(headers?: object, signal?: AbortSignal): Promise<FeeAsksReturn>
}

export interface PingArgs {
}

export interface PingReturn {
  status: boolean  
}
export interface StatusArgs {
}

export interface StatusReturn {
  status: Status  
}
export interface PeersArgs {
}

export interface PeersReturn {
  peers: Array<string>
  priorityPeers: Array<string>  
}
export interface MempoolArgs {
}

export interface MempoolReturn {
  mempool: MempoolView  
}
export interface SendOperationArgs {
  operation: Operation
}

export interface SendOperationReturn {
  operation: string  
}
export interface OperationsArgs {
}

export interface OperationsReturn {
  operations: Operations  
}
export interface FeeAsksArgs {
}

export interface FeeAsksReturn {
  feeAsks: FeeAsks  
}

export interface Debug {
  broadcast(args: BroadcastArgs, headers?: object, signal?: AbortSignal): Promise<BroadcastReturn>
}

export interface BroadcastArgs {
  message: any
}

export interface BroadcastReturn {
  status: boolean  
}


  
//
// Client
//
export class Bundler implements Bundler {
  protected hostname: string
  protected fetch: Fetch
  protected path = '/rpc/Bundler/'

  constructor(hostname: string, fetch: Fetch) {
    this.hostname = hostname
    this.fetch = (input: RequestInfo, init?: RequestInit) => fetch(input, init)
  }

  private url(name: string): string {
    return this.hostname + this.path + name
  }
  
  ping = (headers?: object, signal?: AbortSignal): Promise<PingReturn> => {
    return this.fetch(
      this.url('Ping'),
      createHTTPRequest({}, headers, signal)
      ).then((res) => {
      return buildResponse(res).then(_data => {
        return {
          status: <boolean>(_data.status),
        }
      })
    }, (error) => {
      throw WebrpcRequestFailedError.new({ cause: `fetch(): ${error.message || ''}` })
    })
  }
  
  status = (headers?: object, signal?: AbortSignal): Promise<StatusReturn> => {
    return this.fetch(
      this.url('Status'),
      createHTTPRequest({}, headers, signal)
      ).then((res) => {
      return buildResponse(res).then(_data => {
        return {
          status: <Status>(_data.status),
        }
      })
    }, (error) => {
      throw WebrpcRequestFailedError.new({ cause: `fetch(): ${error.message || ''}` })
    })
  }
  
  peers = (headers?: object, signal?: AbortSignal): Promise<PeersReturn> => {
    return this.fetch(
      this.url('Peers'),
      createHTTPRequest({}, headers, signal)
      ).then((res) => {
      return buildResponse(res).then(_data => {
        return {
          peers: <Array<string>>(_data.peers),
          priorityPeers: <Array<string>>(_data.priorityPeers),
        }
      })
    }, (error) => {
      throw WebrpcRequestFailedError.new({ cause: `fetch(): ${error.message || ''}` })
    })
  }
  
  mempool = (headers?: object, signal?: AbortSignal): Promise<MempoolReturn> => {
    return this.fetch(
      this.url('Mempool'),
      createHTTPRequest({}, headers, signal)
      ).then((res) => {
      return buildResponse(res).then(_data => {
        return {
          mempool: <MempoolView>(_data.mempool),
        }
      })
    }, (error) => {
      throw WebrpcRequestFailedError.new({ cause: `fetch(): ${error.message || ''}` })
    })
  }
  
  sendOperation = (args: SendOperationArgs, headers?: object, signal?: AbortSignal): Promise<SendOperationReturn> => {
    return this.fetch(
      this.url('SendOperation'),
      createHTTPRequest(args, headers, signal)).then((res) => {
      return buildResponse(res).then(_data => {
        return {
          operation: <string>(_data.operation),
        }
      })
    }, (error) => {
      throw WebrpcRequestFailedError.new({ cause: `fetch(): ${error.message || ''}` })
    })
  }
  
  operations = (headers?: object, signal?: AbortSignal): Promise<OperationsReturn> => {
    return this.fetch(
      this.url('Operations'),
      createHTTPRequest({}, headers, signal)
      ).then((res) => {
      return buildResponse(res).then(_data => {
        return {
          operations: <Operations>(_data.operations),
        }
      })
    }, (error) => {
      throw WebrpcRequestFailedError.new({ cause: `fetch(): ${error.message || ''}` })
    })
  }
  
  feeAsks = (headers?: object, signal?: AbortSignal): Promise<FeeAsksReturn> => {
    return this.fetch(
      this.url('FeeAsks'),
      createHTTPRequest({}, headers, signal)
      ).then((res) => {
      return buildResponse(res).then(_data => {
        return {
          feeAsks: <FeeAsks>(_data.feeAsks),
        }
      })
    }, (error) => {
      throw WebrpcRequestFailedError.new({ cause: `fetch(): ${error.message || ''}` })
    })
  }
  
}
export class Debug implements Debug {
  protected hostname: string
  protected fetch: Fetch
  protected path = '/rpc/Debug/'

  constructor(hostname: string, fetch: Fetch) {
    this.hostname = hostname
    this.fetch = (input: RequestInfo, init?: RequestInit) => fetch(input, init)
  }

  private url(name: string): string {
    return this.hostname + this.path + name
  }
  
  broadcast = (args: BroadcastArgs, headers?: object, signal?: AbortSignal): Promise<BroadcastReturn> => {
    return this.fetch(
      this.url('Broadcast'),
      createHTTPRequest(args, headers, signal)).then((res) => {
      return buildResponse(res).then(_data => {
        return {
          status: <boolean>(_data.status),
        }
      })
    }, (error) => {
      throw WebrpcRequestFailedError.new({ cause: `fetch(): ${error.message || ''}` })
    })
  }
  
}

  const createHTTPRequest = (body: object = {}, headers: object = {}, signal: AbortSignal | null = null): object => {
  return {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
    signal
  }
}

const buildResponse = (res: Response): Promise<any> => {
  return res.text().then(text => {
    let data
    try {
      data = JSON.parse(text)
    } catch(error) {
      let message = ''
      if (error instanceof Error)  {
        message = error.message
      }
      throw WebrpcBadResponseError.new({
        status: res.status,
        cause: `JSON.parse(): ${message}: response text: ${text}`},
      )
    }
    if (!res.ok) {
      const code: number = (typeof data.code === 'number') ? data.code : 0
      throw (webrpcErrorByCode[code] || WebrpcError).new(data)
    }
    return data
  })
}

//
// Errors
//

export class WebrpcError extends Error {
  name: string
  code: number
  message: string
  status: number
  cause?: string

  /** @deprecated Use message instead of msg. Deprecated in webrpc v0.11.0. */
  msg: string

  constructor(name: string, code: number, message: string, status: number, cause?: string) {
    super(message)
    this.name = name || 'WebrpcError'
    this.code = typeof code === 'number' ? code : 0
    this.message = message || `endpoint error ${this.code}`
    this.msg = this.message
    this.status = typeof status === 'number' ? status : 0
    this.cause = cause
    Object.setPrototypeOf(this, WebrpcError.prototype)
  }

  static new(payload: any): WebrpcError {
    return new this(payload.error, payload.code, payload.message || payload.msg, payload.status, payload.cause)
  }
}

// Webrpc errors

export class WebrpcEndpointError extends WebrpcError {
  constructor(
    name: string = 'WebrpcEndpoint',
    code: number = 0,
    message: string = 'endpoint error',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcEndpointError.prototype)
  }
}

export class WebrpcRequestFailedError extends WebrpcError {
  constructor(
    name: string = 'WebrpcRequestFailed',
    code: number = -1,
    message: string = 'request failed',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcRequestFailedError.prototype)
  }
}

export class WebrpcBadRouteError extends WebrpcError {
  constructor(
    name: string = 'WebrpcBadRoute',
    code: number = -2,
    message: string = 'bad route',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcBadRouteError.prototype)
  }
}

export class WebrpcBadMethodError extends WebrpcError {
  constructor(
    name: string = 'WebrpcBadMethod',
    code: number = -3,
    message: string = 'bad method',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcBadMethodError.prototype)
  }
}

export class WebrpcBadRequestError extends WebrpcError {
  constructor(
    name: string = 'WebrpcBadRequest',
    code: number = -4,
    message: string = 'bad request',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcBadRequestError.prototype)
  }
}

export class WebrpcBadResponseError extends WebrpcError {
  constructor(
    name: string = 'WebrpcBadResponse',
    code: number = -5,
    message: string = 'bad response',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcBadResponseError.prototype)
  }
}

export class WebrpcServerPanicError extends WebrpcError {
  constructor(
    name: string = 'WebrpcServerPanic',
    code: number = -6,
    message: string = 'server panic',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcServerPanicError.prototype)
  }
}

export class WebrpcInternalErrorError extends WebrpcError {
  constructor(
    name: string = 'WebrpcInternalError',
    code: number = -7,
    message: string = 'internal error',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcInternalErrorError.prototype)
  }
}

export class WebrpcClientDisconnectedError extends WebrpcError {
  constructor(
    name: string = 'WebrpcClientDisconnected',
    code: number = -8,
    message: string = 'client disconnected',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcClientDisconnectedError.prototype)
  }
}

export class WebrpcStreamLostError extends WebrpcError {
  constructor(
    name: string = 'WebrpcStreamLost',
    code: number = -9,
    message: string = 'stream lost',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcStreamLostError.prototype)
  }
}

export class WebrpcStreamFinishedError extends WebrpcError {
  constructor(
    name: string = 'WebrpcStreamFinished',
    code: number = -10,
    message: string = 'stream finished',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcStreamFinishedError.prototype)
  }
}


// Schema errors

export class NotFoundError extends WebrpcError {
  constructor(
    name: string = 'NotFound',
    code: number = 1000,
    message: string = 'Not found',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class UnauthorizedError extends WebrpcError {
  constructor(
    name: string = 'Unauthorized',
    code: number = 2000,
    message: string = 'Unauthorized access',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

export class PermissionDeniedError extends WebrpcError {
  constructor(
    name: string = 'PermissionDenied',
    code: number = 3000,
    message: string = 'Permission denied',
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, PermissionDeniedError.prototype)
  }
}


export enum errors {
  WebrpcEndpoint = 'WebrpcEndpoint',
  WebrpcRequestFailed = 'WebrpcRequestFailed',
  WebrpcBadRoute = 'WebrpcBadRoute',
  WebrpcBadMethod = 'WebrpcBadMethod',
  WebrpcBadRequest = 'WebrpcBadRequest',
  WebrpcBadResponse = 'WebrpcBadResponse',
  WebrpcServerPanic = 'WebrpcServerPanic',
  WebrpcInternalError = 'WebrpcInternalError',
  WebrpcClientDisconnected = 'WebrpcClientDisconnected',
  WebrpcStreamLost = 'WebrpcStreamLost',
  WebrpcStreamFinished = 'WebrpcStreamFinished',
  NotFound = 'NotFound',
  Unauthorized = 'Unauthorized',
  PermissionDenied = 'PermissionDenied',
}

const webrpcErrorByCode: { [code: number]: any } = {
  [0]: WebrpcEndpointError,
  [-1]: WebrpcRequestFailedError,
  [-2]: WebrpcBadRouteError,
  [-3]: WebrpcBadMethodError,
  [-4]: WebrpcBadRequestError,
  [-5]: WebrpcBadResponseError,
  [-6]: WebrpcServerPanicError,
  [-7]: WebrpcInternalErrorError,
  [-8]: WebrpcClientDisconnectedError,
  [-9]: WebrpcStreamLostError,
  [-10]: WebrpcStreamFinishedError,
  [1000]: NotFoundError,
  [2000]: UnauthorizedError,
  [3000]: PermissionDeniedError,
}

export type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>

