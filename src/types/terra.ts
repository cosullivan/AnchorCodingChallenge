// NOTE: some of these  definitions have been lifted from here https://github.com/terra-money/fcd/blob/main/src/types/

export type Coins = Coin[] | null

export interface Coin {
    amount: string
    denom: string
}
    
export interface CoinByDenoms {
    // common coin interface for issuance, price, communitypool for denoms set
    ukrw?: string // bigint value
    uluna?: string // bigint value
    umnt?: string // bigint value
    usdr?: string // bigint value
    uusd?: string // bigint value
}

export interface Log {
    msg_index: number
    log:
      | string
      | { tax: string }
    events?: Event[]
}

export interface Event {
    type: string
    attributes: {
        key: string
        value: string
    }[]
 }

export interface Value {
    fee: {
        amount: Coin[]
        gas: string
    }
    msg: ContractMessage[]
    signatures: Signature[]
    memo: string
}

export interface MsgExecuteContract {
    type: "wasm/MsgExecuteContract",
    value: {
        sender: string;
        contract: string;
        execute_msg: string;
        coins: Coins;
    }
}

export interface UnknownMessage {
    type: string
    value: { [key: string]: any }
}

export type ContractMessage = MsgExecuteContract | UnknownMessage;

export interface Signature {
    pub_key: {
        type: string
        value: string
    }
    signature: string
}

export interface LcdTx {
    type: string
    value: Value
}

export interface LcdTransaction {
    height: string
    txhash: string
    raw_log: string
    logs: Log[] // doesn't exist if tx failed
    gas_wanted: string
    gas_used: string
    codespace: string
    code?: number
    tx: LcdTx
    timestamp: string // unix time at GMT 0
    events: Event[]
}

interface NewBlockMessage {
    type: 'new_block',
    chain_id: string,
    data: {
        block: {
            header: {
                height: number;
                time: string;
            }
        },
        txs: Array<LcdTransaction>
    }
}

type BlockChainMessage = NewBlockMessage; // | SomeOtherMessage ...

export { BlockChainMessage, NewBlockMessage };