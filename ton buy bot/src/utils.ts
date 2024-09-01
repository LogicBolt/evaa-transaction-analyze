import axios from 'axios';
import TonWeb from 'tonweb';
const imgArray = [

    "https://ipfs.io/ipfs/QmdzEHE39Ag5mtcwdYqDdhcwjbi619KYTgQH4bCizoZN18/1.jfif",
    "https://ipfs.io/ipfs/QmdzEHE39Ag5mtcwdYqDdhcwjbi619KYTgQH4bCizoZN18/2.jfif",
    "https://ipfs.io/ipfs/QmdzEHE39Ag5mtcwdYqDdhcwjbi619KYTgQH4bCizoZN18/3.jfif",
    "https://ipfs.io/ipfs/QmdzEHE39Ag5mtcwdYqDdhcwjbi619KYTgQH4bCizoZN18/4.jfif",
    "https://ipfs.io/ipfs/QmdzEHE39Ag5mtcwdYqDdhcwjbi619KYTgQH4bCizoZN18/5.jfif"
]

export const getRandomURL = () => {
    return imgArray[Math.floor(Math.random() * (imgArray.length - 1))]
}

export const getBuyInfo = async (jettonAddress : string, pairAddress : string) => {

    if (jettonAddress === undefined || jettonAddress.length === 0)
        return undefined;
 
    // const jettonDetail = await axios.get(
    //     `https://tonapi.io/v2/jettons/${jettonAddress}`
    // );

    // if (!jettonDetail) return undefined;

    // const name = jettonDetail.data.metadata.name;
    // const decimal = jettonDetail.data.metadata.decimals;
    let buyInfoData: any[] = [];
    // const Baccounts = await axios.get(
    //     `https://tonapi.io/v2/blockchain/accounts/${pairAddress}`
    // );

    // let last_tx = Baccounts.data.last_transaction_lt;

    setInterval(async () => {
        try {
            console.log("=========== 3 seconds =============");
            // const transactions = await axios.get(
            //     `https://tonapi.io/v2/blockchain/accounts/${pairAddress}/transactions?last_lt=${last_tx}`
            // );

            // if (transactions.data.length > 0) {
            //     last_tx = transactions.data[0].lt;
            //     buyInfoData.push(...transactions.data);
            //     console.log("New transactions:", transactions.data);
            // }
        } catch (err) {
            console.error('Error fetching transactions:', err);
        }
    }, 3000);

    return buyInfoData;
}