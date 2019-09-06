const cryptoHash=require('./crypto-hash');

describe('cryptoHash()',()=>{
    it('generates sha-256 hashed output',()=>{
        expect(cryptoHash('foo')).toEqual("2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae");
    });

    it('produces the same hash with same input arguments',()=>{
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('three','one','two'));
    }); 
});