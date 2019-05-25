'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;

const ccpPath = path.resolve(__dirname, 'att-documents_ATTComplianceContract_profile.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function main() {
    try {

        // Create a CA client for interacting with the appropriate CA.
        const caURL = ccp.certificateAuthorities[argv.caAddress].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled this user.
        const userExists = await wallet.exists(argv.userName);
        if (userExists) {
            console.log(`An identity for user "${argv.userName}" already exists in the wallet`);
            return;
        }

        // Enroll the user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: argv.userName, enrollmentSecret: argv.userPassword });
        const identity = X509WalletMixin.createIdentity(argv.msp, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(argv.userName, identity);
        console.log(`Successfully enrolled client "${argv.userName}" and imported it into the wallet`);

    } catch (error) {
        console.error(`Failed to enroll "${argv.userName}": ${error}`);
        process.exit(1);
    }
}

main();
