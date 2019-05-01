'use strict';

const { Contract } = require('fabric-contract-api');

class ATTContract extends Contract {

    //initial state
    async instantiate(ctx) {
    }


    // look up data by key
    async query(ctx, key) {
    }
}

module.exports = ATTContract;