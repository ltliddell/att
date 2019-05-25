'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

let gateway;
let contract;

async function connect() {
    // Parse the connection profile
    const ccpPath = path.resolve(__dirname, 'att-documents_ATTComplianceContract_profile.json');
    const connectionProfile = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Configure a wallet
    const walletPath = path.resolve(__dirname, 'wallet');
    const wallet = new FileSystemWallet(walletPath);

    // Create a new gateway, and connect to the gateway peer node(s). The identity
    // specified must already exist in the specified wallet.
    gateway = new Gateway();
    await gateway.connect(connectionProfile, { wallet, identity: 'degov' , discovery: {enabled: true, asLocalhost:false }});

    // Get the network channel that the smart contract is deployed to.
    const network = await gateway.getNetwork('att-documents');

    // Get the smart contract from the network channel.
    contract = network.getContract('ATTComplianceContract');

    console.log('Connected successfully');
}

async function disconnect() {
    await gateway.disconnect();
    console.log('Disconnected successfully');
}

async function main() {
    try {

        console.time('TxSubmit');
        await connect();

        //Create an EUC application request
        let eucList = await contract.submitTransaction('readEUCRequestsWithState', 'false');
        console.log(JSON.parse(eucList.toString()));

        await disconnect();

        console.timeEnd('TxSubmit');

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}
main();
