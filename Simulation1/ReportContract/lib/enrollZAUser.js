'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, 'att-documents_ATTSimulation1_profile.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function main() {
    try {

        // Create a CA client for interacting with the ZA CA.
        const caURL = ccp.certificateAuthorities['50.23.5.212:32296'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the ZA user.
        const userExists = await wallet.exists('za_app_user');
        if (userExists) {
            console.log('An identity for "za_app_user" already exists in the wallet');
            return;
        }

        // Enroll the ZA user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'za_app_user', enrollmentSecret: 'za_app_userpw' });
        const identity = X509WalletMixin.createIdentity('za-msp', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import('za_app_user', identity);
        console.log('Successfully enrolled client "za_app_user" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll "za_app_user": ${error}`);
        process.exit(1);
    }
}

main();
