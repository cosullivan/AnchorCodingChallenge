import { client as WebSocketClient } from 'websocket';
import { deserializeMessage } from './serialization';
import { IBlock, Event } from './types/events';
import { BlockChainMessage } from './types/terra';

type Attribute = {
    key: string;
    value: string;
}

type EventCallback = (event: Event) => void;

export class BlockListener {

    // convert the list of attributes into an event
    private eventFactory(block: IBlock, attributes: Array<Attribute>): Event {
        let event = { ...block };
        attributes.forEach(attribute => {
            event[attribute.key] = attribute.value;
        })
        return event as Event;
    }

    // map the message content into the relevent events for the event source
    private mapEvents(message: BlockChainMessage) {

        // not sure the best way to pull these structured events from the message
        // data, the event logs looks the easiest for a prototype but I would 
        // think the more correct way would be to base64 decode the execute_msg 
        // property on the actual msg

        const logs = message.data.txs.flatMap(txs => txs.logs).filter(log => log && log.events !== undefined);

        const events = logs.flatMap(log => log.events).filter(event => event.type === "from_contract");
        
        return events.map(event => this.eventFactory({ height: message.data.block.header.height }, event.attributes));
    }

    // start the listener to listen for the events
    listen(height: number, subscription: EventCallback) {
        const client = new WebSocketClient();
    
        client.on('connectFailed', error => {
        });
        
        client.on('connect', connection => {
            connection.on('error', error => {
            });

            connection.on('close', () => {
            });

            connection.on('message', message => {
                if (message.type === 'utf8') {
                    const msg = deserializeMessage(message.utf8Data);
                    
                    // filter the events from the log of the message and use that to 
                    // create the structured events that we are interested in processing
                    const events = this.mapEvents(msg);
                    
                    // call the subscriber for each of the events
                    events.forEach(subscription);
                }
            });

            // if the Terra Observer allowed us to pass the block height to start observing
            // from it could make for a nice way to restore from a checkpoint on failure
            // as we could then pass a previous block height and those messages would 
            // flood in and eventually we would catch up to the current block 
            connection.send(JSON.stringify({ 
                subscribe: "new_block", 
                chain_id: "columbus-4" 
            }));
        })

        client.connect('wss://observer.terra.dev');
    }
}