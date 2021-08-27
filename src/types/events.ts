export enum MarketEventType {
    borrow_stable = "borrow_stable",
    repay_stable = "repay_stable"
}

export interface IBlock {
    height: number;
}

export interface IBorrowerEvent extends IBlock {
    contract_address: string;
    borrower: string;
}

export interface IBorrowStableEvent extends IBorrowerEvent {
    action: MarketEventType.borrow_stable;
    borrow_amount: number;
}

export interface IRepayStableEvent extends IBorrowerEvent {
    action: MarketEventType.repay_stable;
    repay_amount: number;
}

// export interface IUnknownEvent extends IBorrowerEvent {
//     action: string;
// }

export type Event = IBorrowStableEvent | IRepayStableEvent;