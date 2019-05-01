/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { AttReportContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('AttReportContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new AttReportContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"att report 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"att report 1002 value"}'));
    });

    describe('#attReportExists', () => {

        it('should return true for a att report', async () => {
            await contract.attReportExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a att report that does not exist', async () => {
            await contract.attReportExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createAttReport', () => {

        it('should create a att report', async () => {
            await contract.createAttReport(ctx, '1003', 'att report 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"att report 1003 value"}'));
        });

        it('should throw an error for a att report that already exists', async () => {
            await contract.createAttReport(ctx, '1001', 'myvalue').should.be.rejectedWith(/The att report 1001 already exists/);
        });

    });

    describe('#readAttReport', () => {

        it('should return a att report', async () => {
            await contract.readAttReport(ctx, '1001').should.eventually.deep.equal({ value: 'att report 1001 value' });
        });

        it('should throw an error for a att report that does not exist', async () => {
            await contract.readAttReport(ctx, '1003').should.be.rejectedWith(/The att report 1003 does not exist/);
        });

    });

    describe('#updateAttReport', () => {

        it('should update a att report', async () => {
            await contract.updateAttReport(ctx, '1001', 'att report 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"att report 1001 new value"}'));
        });

        it('should throw an error for a att report that does not exist', async () => {
            await contract.updateAttReport(ctx, '1003', 'att report 1003 new value').should.be.rejectedWith(/The att report 1003 does not exist/);
        });

    });

    describe('#deleteAttReport', () => {

        it('should delete a att report', async () => {
            await contract.deleteAttReport(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a att report that does not exist', async () => {
            await contract.deleteAttReport(ctx, '1003').should.be.rejectedWith(/The att report 1003 does not exist/);
        });

    });

});