import { BlockChainMessage } from './types/terra';

const deserializeMessage = (data: string): BlockChainMessage =>  {
    const message: BlockChainMessage = JSON.parse(data);
    return message;
}

export { deserializeMessage }