const Blockchain=require('../app/blockchain');
const Block=require('../app/block');
const cryptohash=require('../app/crypto-hash');

describe('Blockchain',()=>{
    let blockchain,newChain,originalChain;

    beforeEach(()=>{
        blockchain = new Blockchain();
        newChain= new Blockchain();
        originalChain=blockchain.chain;
    });

    it('contains a `chain` Array',()=>{
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block',()=>{
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain',()=>{
        const newData='fooBar';
        blockchain.addBlock({data:newData})
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isChainValid()',()=>{
        describe('when the chain doesn`t start with the genesis block',()=>{
            it('returns false',()=>{
                blockchain.chain[0]={ data:'fake-genesis'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with the genesis block & has multiple blocks',()=>{
            beforeEach(()=>{
                blockchain.addBlock({data: 'Hello! I am first.'});
                blockchain.addBlock({data: 'Hey! I am second.'});
                blockchain.addBlock({data: 'Hurrah! I am third.'});
            });

            describe('and a lastHash reference has changed',()=>{
                it('returns false',()=>{
                    blockchain.chain[2].lastHash='broken-chain';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with jumped difficulty',()=>{
                it('returns false',()=>{
                    const lastBlock=blockchain.chain[blockchain.chain.length-1];
                    const lastHash=lastBlock.hash;
                    const timestamp=Date.now();
                    const nonce=0;
                    const data=[];
                    const difficulty=lastBlock.difficulty-3;

                    const hash=cryptohash(timestamp,lastHash,nonce,data,difficulty);
                    const badBlock=new Block({
                        data,timestamp,lastHash,hash,nonce,difficulty
                    });

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with invalid field',()=>{
                it('returns false',()=>{
                    blockchain.chain[2].data='some bad & evil data.';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
        
            describe('and the chain doesn`t contain any invalid block',()=>{
                it('returns true',()=>{
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);    
                });
            });
        });
    });

    describe('replaceChain',()=>{
        let errorMock, logMock;
        beforeEach(()=>{
            errorMock=jest.fn();
            logMock=jest.fn();
            global.console.error=errorMock;
            global.console.log=logMock;
        });
        describe('when the new chain is not longer',()=>{
            beforeEach(()=>{
                newChain.chain[0]={new: 'chain'};
                blockchain.replaceChain(newChain.chain);
            });
            it('does not replace the chain',()=>{
                expect(blockchain.chain).toEqual(originalChain);
            });
            it('logs an error',()=>{
                expect(errorMock).toHaveBeenCalled();
            });
        });
        describe('when the new chain is longer',()=>{
            beforeEach(()=>{
                newChain.addBlock({data: 'Hello! I am first.'});
                newChain.addBlock({data: 'Hey! I am second.'});
                newChain.addBlock({data: 'Hurrah! I am third.'});
            });
            describe('and the chain is invalid',()=>{
                beforeEach(()=>{
                    newChain.chain[2].hash='some-fake-hash';
                    blockchain.replaceChain(newChain.chain);
                });
                it('does not replace the original chain',()=>{
                    expect(blockchain.chain).toEqual(originalChain);
                });
                it('logs an error',()=>{
                    expect(errorMock).toHaveBeenCalled();
                });
            });
            describe('and the chain is valid',()=>{
                beforeEach(()=>{
                    blockchain.replaceChain(newChain.chain);
                });
                it('replaces the chain',()=>{  
                    expect(blockchain.chain).not.toEqual(originalChain);
                    
                });
                it('logs about the chain replacement',()=>{
                    expect(logMock).toHaveBeenCalled();     
                });
            });
        });
    });
});