import { BlockListener  } from './blockListener';
import { Market as MarketContract, bLunaCustoday as bLunaCustodayContract } from './contracts';
import { MarketEventType } from './types/events';
import { Map } from "immutable";
import express from 'express';

// My thought process around how this could work would be using an event source 
// whereby we convert the new_block feed into a series of structured events
// that are relevant to this app. Those structured events would then be used 
// to maintain a cache that tracked the current state of the each borrower. 

type Borrower = {
    bLunaCollateral: number;
    loanAmount: number;
}

// The cache would likley be something external like Redis but using this to get started
let borrowerCache = Map<string, Borrower>();

// the BlockListener acts as an event source by converting the feed from the Observer 
// into a structured sequence of events on the block chain that the liquidation app 
// is interested in
const blockListener = new BlockListener();

const calculateLiquidationPrice = (loanAmount: number, bLunaCollateral: number, threshold: number): number => {
    return (loanAmount / 1000000) / (bLunaCollateral * threshold)
}

const calculateLiquidationPriceBucket = (liquidationPrice: number): number => {
    return Math.floor((liquidationPrice * 100) / 10) / 10;
}

const updateBorrowerLoanAmount = (wallet: string, amount: number) => {
    let borrower = borrowerCache.get(wallet);

    borrower = borrower ?? {
        bLunaCollateral: 100, // assume everyone has 100 bLuna as collateral as we arent listening all the events
        loanAmount: 0
    };

    borrower = {
        ...borrower,
        loanAmount: Math.max(0, borrower.loanAmount + amount) // stop negatives for now
    }

    borrowerCache = borrowerCache.set(wallet, borrower);
}

// Ideally if the Observer allowed us to listen from a certain block height
// we could use the block height as a checkpoint to if we encountered errors
// listening from an older block height would just stream all of the data
// from those older blocks until it caught up to date but that wouldnt
// be a concern for this listener. The app would need to track the last 
// block height that was successfully stored in the cache.
blockListener.listen(123456, event => {
    switch (event.contract_address) {
        case MarketContract:
            console.log(event.action, event.borrower);
            switch (event.action) {
                case MarketEventType.borrow_stable:
                    updateBorrowerLoanAmount(event.borrower, event.borrow_amount);
                    break;

                case MarketEventType.repay_stable:
                    updateBorrowerLoanAmount(event.borrower, -event.repay_amount);
                    break;
            }
            break;

        case bLunaCustodayContract:
            // I assume this is the correct contract, but this would need
            // to also process the events where the bLuna collateral was
            // locked and unlocked in order to update the bLunaCollateral
            // for the borrower
            break;                
    }
});

const app = express();
const port = 8080;

app.get("/prices", (request, response) => {

    let liquidationPriceBuckets = Map<number, number>();
    borrowerCache.map(borrower => {

        const liquidationPrice = calculateLiquidationPrice(
            borrower.loanAmount,
            borrower.bLunaCollateral, 
            0.6);

        const liquidationPriceBucket = calculateLiquidationPriceBucket(liquidationPrice);
        
        liquidationPriceBuckets = liquidationPriceBuckets.update(
            liquidationPriceBucket,
            (bLunaCollateral = 0) => bLunaCollateral + borrower.bLunaCollateral
        );
    });

    response.json({
        prices: liquidationPriceBuckets.entrySeq().sort((a, b) => a[0] - b[0]).map(bucket => {
            return {
                price: bucket[0],
                volume: bucket[1]
            }
        })
    });
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});