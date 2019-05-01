/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AttReportContract extends Contract {

    async attReportExists(ctx, attReportId) {
        const buffer = await ctx.stub.getState(attReportId);
        return (!!buffer && buffer.length > 0);
    }

    async createAttReport(ctx, attReportId, value) {
        const exists = await this.attReportExists(ctx, attReportId);
        if (exists) {
            throw new Error(`The att report ${attReportId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(attReportId, buffer);
    }

    async readAttReport(ctx, attReportId) {
        const exists = await this.attReportExists(ctx, attReportId);
        if (!exists) {
            throw new Error(`The att report ${attReportId} does not exist`);
        }
        const buffer = await ctx.stub.getState(attReportId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateAttReport(ctx, attReportId, newValue) {
        const exists = await this.attReportExists(ctx, attReportId);
        if (!exists) {
            throw new Error(`The att report ${attReportId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(attReportId, buffer);
    }

    async deleteAttReport(ctx, attReportId) {
        const exists = await this.attReportExists(ctx, attReportId);
        if (!exists) {
            throw new Error(`The att report ${attReportId} does not exist`);
        }
        await ctx.stub.deleteState(attReportId);
    }

}

module.exports = AttReportContract;
