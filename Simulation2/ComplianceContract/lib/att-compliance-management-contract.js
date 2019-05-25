/*
 * SPDX-License-Identifier: Apache-2.0
 * This class borrows heavily from:
 * https://github.com/hyperledger/fabric-samples/blob/release-1.4/chaincode/marbles02/node/marbles_chaincode.js
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AttComplianceContract extends Contract {

    async attArtifactExists(ctx, attArtifactId) {
        const buffer = await ctx.stub.getState(attArtifactId);
        return (!!buffer && buffer.length > 0);
    }

    async createEUCVerificationRequest(ctx, args) {
        console.log(args);

        if (args.length !== 3) {
            throw new Error('Incorrect number of arguments. Expecting 3');
        }

        if (args[0].lenth <= 0) {
            throw new Error('1st argument must be a non-empty string');
        }
        if (args[1].lenth <= 0) {
            throw new Error('2nd argument must be a non-empty string');
        }
        if (args[2].lenth <= 0) {
            throw new Error('3rd argument must be a non-empty string');
        }

        let attEUCId = args[0];
        let requestorID = args[1].toLowerCase();
        let shipmentDetails = args[2].toLowerCase();
        const exists = await this.attArtifactExists(ctx, attEUCId);
        if (exists) {
            throw new Error(`The att EUC verification request ${attEUCId} already exists`);
        }

        let eucRequest = {};
        eucRequest.docType = 'eucRequest';
        eucRequest.requestor = requestorID;
        eucRequest.details = shipmentDetails;
        eucRequest.isApproved = false;

        const buffer = Buffer.from(JSON.stringify(eucRequest));
        await ctx.stub.putState(attEUCId, buffer);
    }

    async readEUCRequest(ctx, attEUCId) {
        const exists = await this.attArtifactExists(ctx, attEUCId);
        if (!exists) {
            throw new Error(`The att EUC request ${attEUCId} does not exist`);
        }
        const buffer = await ctx.stub.getState(attEUCId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async readEUCRequestsWithState(ctx, args) {

        if (args.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting euc state.');
        }

        //let eucState = args[0];
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'eucRequest';
        queryString.selector.isApproved = false;
        console.log(queryString);
        let queryResults = await this.queryComplianceArtifacts(ctx, JSON.stringify(queryString));
        return queryResults;
    }

    async updateEUCRequest(ctx, attEUCId, newValue) {
        const exists = await this.attArtifactExists(ctx, attEUCId);
        if (!exists) {
            throw new Error(`The att EUC request ${attEUCId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(attEUCId, buffer);
    }

    async deleteEUCRequest(ctx, attEUCId) {
        const exists = await this.attArtifactExists(ctx, attEUCId);
        if (!exists) {
            throw new Error(`The att EUC request ${attEUCId} does not exist`);
        }
        await ctx.stub.deleteState(attEUCId);
    }

    async queryComplianceArtifacts(ctx, args) {
        //   0
        // 'queryString'
        if (args.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting queryString');
        }
        let queryString = args;
        if (!queryString) {
            throw new Error('queryString must not be empty');
        }
        let queryResults = await this.getQueryResultForQueryString(ctx, queryString);
        return queryResults;
    }

    async getQueryResultForQueryString(ctx, queryString) {

        console.info('- getQueryResultForQueryString queryString:\n' + queryString);
        let resultsIterator = await ctx.stub.getQueryResult(queryString);

        let results = await this.getAllResults(resultsIterator, false);

        return Buffer.from(JSON.stringify(results));
    }

    async getAllResults(iterator, isHistory) {
        let allResults = [];
        // eslint-disable-next-line no-constant-condition
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));

                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.Timestamp = res.value.timestamp;
                    jsonRes.IsDelete = res.value.is_delete.toString();
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return allResults;
            }
        }
    }

    async getHistoryForComplianceArtifact(stub, args, thisClass) {

        if (args.length < 1) {
            throw new Error('Incorrect number of arguments. Expecting 1');
        }
        let attEUCId = args[0];
        console.info('- start getHistoryForEUCRequest: %s\n', attEUCId);

        let resultsIterator = await stub.getHistoryForKey(attEUCId);
        let method = thisClass.getAllResults;
        let results = await method(resultsIterator, true);

        return Buffer.from(JSON.stringify(results));
    }

}

module.exports = AttComplianceContract;
