import React, { useState, useEffect } from 'react';
import TonWeb from 'tonweb';
import { Buffer } from 'buffer';
import process from 'process';
import { getHttpEndpoint } from "@orbs-network/ton-access";
import {
    TonClient, WalletContractV4, internal, toNano, TonClient4,
    Address,
} from "@ton/ton";
import { mnemonicToWalletKey, mnemonicToPrivateKey } from "@ton/crypto";
// import { TonConnectButton, useTonConnectUI, useTonWallet, useTonConnectModal } from '@tonconnect/ui-react';
import {
    Factory,
    MAINNET_FACTORY_ADDR,
    ReadinessStatus,
    Asset,
    VaultNative,
    JettonRoot,
    JettonWallet,
    PoolType,
    DeDustClient,
    Pool,
    VaultJetton
} from "@dedust/sdk";
import axios from 'axios';
import config from '../config/config'
// import WebSocket from 'ws';
window.Buffer = Buffer;
window.process = process;
// dotenv.config();
const NativeAddress = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"
const evaaAddress = "0:bcad466a47fa565750729565253cd073ca24d856804499090c2100d95c809f9e"
const WalletConnect = () => {

    const [tonPrice, setTonPrice] = useState(null);

    const [walletAddress, setWalletaddress] = useState('')
    const [jettonDetail, setJettonDetail] = useState({})

    // const fetchTonPrice = async () => {
    //     try {
    //         const response = await axios.get('https://tonapi.io/v2/rates?tokens=ton&currencies=usd');
    //         setTonPrice(response.data['rates']['TON']['prices']['USD']);


    //     } catch (err) {
    //         console.error('Failed to fetch TON price:', err);
    //     }
    // };

    const [transactions, setTransactions] = useState([]);


    const getTransactions = async () => {

        try {


            const transactionsData = await axios.get(`https://tonapi.io/v2/blockchain/accounts/UQBghyYO1PSqiHO70FNCE5NpU94rTE3pfxjGpzB2aD6fWVCO/transactions?limit=1000&sort_order=desc`);
            const jettonData = await axios.get(`https://tonapi.io/v2/accounts/UQBghyYO1PSqiHO70FNCE5NpU94rTE3pfxjGpzB2aD6fWVCO/jettons`);
            for (let i = 0; i < transactionsData.data.transactions.length; i++) {
                let eachEle = transactionsData.data.transactions[i]
                if (eachEle.in_msg.decoded_body && eachEle.in_msg.decoded_body.payload && eachEle.in_msg.decoded_body.payload.length > 0) {
                    let payload = eachEle.in_msg.decoded_body.payload[0];
                    // console.log(payload)
                    if (payload && payload.message && payload.message.message_internal && payload.message.message_internal.body.value) {
                        let value = payload.message.message_internal.body.value;
                        // console.log(value)
                        if (value.sum_type === "JettonTransfer" && value.value.destination === evaaAddress) {
                            let jettonAmount = value.value.amount

                            const jettonWalletAddressRaw = payload.message.message_internal.dest
                            const jettonWalletAddress = Address.parse(payload.message.message_internal.dest).toString();
                            let jettonMedata;
                            for (let j = 0; j < jettonData.data.balances.length; j++) {
                                let eachInfo = jettonData.data.balances[j]
                                if (eachInfo.wallet_address.address === jettonWalletAddressRaw)
                                    jettonMedata = eachInfo.jetton

                            }
                            // const jettonmetadata = await axios.get(`https://tonapi.io/v2/jettons/${jettonWalletAddress}`);
                            // const jettonAddress = Address.parse(jettonmetadata.metadata.address).toString();
                            // const jettonData = await axios.get(`https://tonapi.io/v2/jettons/${jettonAddress}`);
                            // console.log(jettonData)
                            jettonAmount = jettonAmount / (10 ** jettonMedata.decimals);
                            console.log("jettonAmount===", jettonAmount)
                            console.log("jettonName===", jettonMedata.symbol)
                            console.log(eachEle.utime)
                        }
                    }
                }
            }

            setTransactions([...transactions, transactionsData.data.transactions]);

        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };


    return (
        <div className="container mx-auto p-4">
            <div className="w-full bg-white p-6 rounded-lg shadow-lg">

                <div className="mt-4 flex items-center">
                    <label className="w-1/3">Address you want to see invested money in EVAA </label>
                    <input
                        id="pair_address"
                        name="pair_address"
                        onChange={(e) => setWalletaddress(e.target.value)}
                        value={walletAddress}
                        className="border rounded w-full py-2 px-3"
                    />
                </div>
                <button onClick={getTransactions} className="bg-blue-500 text-white py-2 px-4 rounded mt-4 hover:bg-blue-700">See Buy transactoins</button>

            </div>
        </div>

    );
};

export default WalletConnect;
