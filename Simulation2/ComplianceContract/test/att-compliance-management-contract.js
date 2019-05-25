/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { AttComplianceContract } = require('..');
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

describe('AttComplianceContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new AttComplianceContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"docType":"eucRequest", "requestor":"za", "details":"1 tank to de", "isApproved": false}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"docType":"eucRequest", "requestor":"de", "details":"1 gun to za", "isApproved": false}'));
    });

    describe('#attArtifactExists', () => {

        it('should return true for an artifact', async () => {
            await contract.attArtifactExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for an artifact that does not exist', async () => {
            await contract.attArtifactExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createEUCVerificationRequest', () => {

        it('should create an EUC Request', async () => {
            await contract.createEUCVerificationRequest(ctx, ['1003', 'za', '3 jets to jm']);
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"docType":"eucRequest","requestor":"za","details":"3 jets to jm","isApproved":false}'));
        });

        it('should throw an error for an EUC Request that already exists', async () => {
            await contract.createEUCVerificationRequest(ctx, ['1001', 'za', '3 jets to jm']).should.be.rejectedWith(/The att EUC verification request 1001 already exists/);
        });

    });

    describe('#readEUCRequest', () => {

        it('should return an EUC Request', async () => {
            await contract.readEUCRequest(ctx, '1001').should.eventually.deep.equal({ docType: 'eucRequest', requestor: 'za', details: '1 tank to de', isApproved: false});
        });

        it('should throw an error for EUC Request that does not exist', async () => {
            await contract.readEUCRequest(ctx, '1003').should.be.rejectedWith(/The att EUC request 1003 does not exist/);
        });

    });


    describe('#readEUCRequestsWithState', () => {

        it('should return a list of EUC Request', async () => {
            await contract.readEUCRequestsWithState(ctx, false).should.eventually.deep.equal({ docType: 'eucRequest', requestor: 'za', details: '1 tank to de', isApproved: false});
        });

    });

});