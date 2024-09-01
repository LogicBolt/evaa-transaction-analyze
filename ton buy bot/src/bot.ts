import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import request from "request";
import { getRandomURL } from './utils';
import axios from 'axios'
dotenv.config();
import TonWeb from 'tonweb';

const tonweb = new TonWeb();

const Address = TonWeb.utils.Address;
// export const COMMAND_START = "start";

export enum OptionCode {
    BACK = -100,
    CLOSE,
    TITLE,
    WELCOME = 0,
    MAIN_MENU,
    MAIN_HELP,
    MAIN_NEW_TOKEN,
    MAIN_START_STOP,
    MAIN_SET_TARGET,
    MAIN_SET_RATING,
    MAIN_SET_BUY_AMOUNT,
    MAIN_WITHDRAW_SOL,
    MAIN_SET_WALLET_SIZE,
    MAIN_DIVIDE_SOL,
    MAIN_GATHER_SOL,
    MAIN_REFRESH,
    MAIN_EXPORT_KEY,

    HELP_BACK
}

export enum StateCode {
    IDLE = 1000,
    WAIT_WITHDRAW_WALLET_ADDRESS,
    WAIT_SET_WALLET_SIZE,
    WAIT_SET_TOKEN_SYMBOL,
    WAIT_SET_TARGET,
    WAIT_SET_RATING,
    WAIT_SET_BUY_AMOUNT,
}
export {
    getRandomURL
} from './utils'
export let bot: TelegramBot;
export let myInfo: TelegramBot.User;
export const sessions = new Map();
export const stateMap = new Map();
let imgURL = "blob:https://web.telegram.org/6cd0e80b-5375-40a6-abb4-405be07166e1"
export let busy = true
bot = new TelegramBot(process.env.BOT_TOKEN as string, {
    polling: true,
});
let chatid = ''
chatid = process.env.ALERT_CHAT_ID || ''
const jettonAddress = "EQDnrMRd7ZCLSbgPNDNT5EuvmxPbDnV7dboxl8PnttCdLcWJ"
const poolAddress = "EQBVyCo5qsuePthOCKEq1MynEqVYQ2e57Hf0l7KvsFrtwhix"
let last_tx = 0


export const openMessage = async (
    chatId: number,
    bannerId: string,
    // messageType: number,
    menuTitle: string
) => {
    return new Promise(async (resolve, reject) => {
        // await removeMenu(chatId, messageType);

        let msg: TelegramBot.Message;

        try {

            if (bannerId) {
                msg = await bot.sendPhoto(chatId, "https://gateway.irys.xyz/mHA4vBz7DSIRNmz1Psd6N7YwMOwQnjT-Ly6P5XqoT7s", {
                    caption: menuTitle,
                    parse_mode: "HTML",
                });
            } else {
                console.log(chatId, bannerId, menuTitle)
                msg = await bot.sendMessage(chatId, menuTitle, {
                    parse_mode: "HTML",
                    disable_web_page_preview: true,
                });
            }

            // stateMap_setMessage_Id(chatId, messageType, msg.message_id);
            // console.log('chatId, messageType, msg.message_id', chatId, messageType, msg.message_id)
            resolve({ messageId: msg.message_id, chatid: msg.chat.id });
        } catch (error) {
            // afx.errorLog("openMenu", error);
            resolve(null);
        }
    });
};

export async function sendAlertData(ChatID: number) {
    const NEW_MSG = `CRYPTOKIT Buy Bot by BTCAT
     <img src="${imgURL}">Photon</img> 
     Welcome to Cryptokit Buy Bot by BTCAT
     To start, choose any of the actions below
    `
    let logURI = ""
    sendAlertMessage(ChatID, NEW_MSG, logURI)
}

export const sendAlertMessage = async (chatid: number, message: string, logUri: string) => {
    return openMessage(chatid, logUri, message);
};
const getBuyInfo = async (jettonAddress: string, pairAddress: string, chainid: string) => {
    if (!jettonAddress || jettonAddress.length === 0) return undefined;

    let buyInfoData: any[] = [];
    const jettonDetail = await axios.get(
        `https://tonapi.io/v2/jettons/${jettonAddress}`
    );
    const name = jettonDetail.data.metadata.name;
    const decimal = jettonDetail.data.metadata.decimals;

    try {
        console.log("=========== 3 seconds =============");

        // setTimeout(() => {
        // }, (2000));
        const transactionsData = await axios.get(
            `https://tonapi.io/v2/blockchain/accounts/${pairAddress}/transactions?after_lt=${last_tx}&sort_order=desc`
        );
        if(transactionsData.data.transactions.length > 0){
            for( let index = 0; index < transactionsData.data.transactions.length; index ++){
                let item = transactionsData.data.transactions[index];
                if (item.in_msg.decoded_body && item.out_msgs[0].decoded_body && item.out_msgs[0].decoded_op_name === "dedust_swap") {
                    const inMsgData = item.in_msg.decoded_body;
                    const data = item.out_msgs[0].decoded_body;
                    console.log(data);
    
                    //@ get pool information
    
                    const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${jettonAddress}`);
                    const poolInfo = response.data.pairs[0];
                    let MCap = poolInfo.fdv;
                    let riceUsd = poolInfo.priceUsd;
                    let liquidity = poolInfo.liquidity["usd"]
                    const sendAddr = new Address(
                        inMsgData["sender_addr"]
                    );
                    let sendAddress = sendAddr.toString(true, true, true)
    
                    if (data.asset_out.sum_type === "Jetton") {
                        // const addr = new Address(
                        //     '0:' + data.asset_out.jetton.address
                        // );
                        console.log("=============buy================")
                        buyInfoData.push({
                            name: name,
                            riceUsd: riceUsd,
                            MCap: MCap,
                            liquidity: liquidity,
                            sendAddress: sendAddress,
                            TonAmount: data.amount_in / (10 ** 9),
                            jettonAmount: data.amount_out / (10 ** decimal),
                        })
                    }
                }
                if (transactionsData.data.transactions.length > 0)
                    last_tx =
                        transactionsData.data.transactions[
                            transactionsData.data.transactions.length - 1
                        ].lt;
            }
        } 
        console.log('==================== end ==================')
        console.log(buyInfoData)
        // buyInfoData.push(simulatedTransaction);
        return buyInfoData;

        // Here we can call the bot.sendPhoto function to send the data in real-time

    } catch (err) {
        console.error('Error fetching transactions:', err);
    }


};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendPhoto(chatId, request(getRandomURL()), {
        caption: `
        Welcome to Cryptokit Buy Bot by BTCAT.
        To start, choose any of the actions below:
        `,
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Set Welcome", callback_data: "button_welcome"
                    }
                ],
                [
                    {
                        text: "Set Buy Bot", callback_data: "button_bot"
                    }
                ]

            ]
        }

    });

    sendAlertData(chatId)
});

const onMessageHandler = async (message : any) => {
    const msgType = message?.chat?.type;
    const chatid = message?.chat?.id;
    if (!chatid) return;
    if (msgType === "private") {
       console.log("========= private ======")
       await bot.sendMessage(chatid, "you have to ", {
        parse_mode: "HTML",
        disable_web_page_preview: true,
    });
      } else if (msgType === "group" || msgType === "supergroup") {
        console.log("========= group ======")
      } else if (msgType === "channel") {
      }
}

export async function init() {
    // sendAlertData()
    busy = true
    const Baccounts = await axios.get(
        `https://tonapi.io/v2/blockchain/accounts/${poolAddress}`
    );
    last_tx = Baccounts.data.last_transaction_lt;

    bot.getMe().then((info: TelegramBot.User) => {
        myInfo = info;
    });

    bot.on("message", async (message: any) => {
  
        onMessageHandler(message);
    });



    bot.on(
        "callback_query",
        async (callbackQuery: TelegramBot.CallbackQuery) => {
            console.log('========== callback query ==========')
            console.log(callbackQuery)
            console.log('====================================')

            const message = callbackQuery.message;

            if (!message) {
                return;
            }

            const option = (callbackQuery.data as string);
            console.log(option)
            let chatid = message.chat.id.toString();
            if (option === 'button_bot') {
                bot.editMessageReplyMarkup({
                    inline_keyboard: [
                        [
                            {
                                text: "DeDust", callback_data: "button_dedust"
                            }
                        ],
                        [
                            {
                                text: "Ston.fi", callback_data: "button_stonfi"
                            }
                        ],
                        [
                            {
                                text: "GasPump", callback_data: "button_gaspump"
                            }
                        ]

                    ]
                },
                    {
                        chat_id: chatid, message_id: message?.message_id
                    }
                )
            }
            if (option === 'button_dedust') {
          
                setInterval(async () => {
                    try {
                        const data = await getBuyInfo(jettonAddress, poolAddress, chatid)
                        console.log("=============get buy info==============", data)

                        if (data && data?.length > 0) {
                            data.map(info => {
                                const numDogs = Math.min(Math.floor(info.TonAmount/2), 100); // Adjust the divisor and max number as needed
                                const dogsEmoji = '🐶'.repeat(numDogs);
                                bot.sendPhoto(chatid, request(getRandomURL()), {
                                    caption: `
🆕  BUY ${info.name} 🆕 
${dogsEmoji}
                                
🙏 ${info.TonAmount} TON ($${info.jettonAmount * info.riceUsd })
💰 ${info.jettonAmount} 
📊 Market Cap $${info.MCap}
💲  price: $${info.riceUsd}
🏦 Holders: 2.86K
🗣️ <a href="https://tonviewer.com/${info.sendAddress}">${info.sendAddress} </a>
📈 <a href="https://dedust.io">DexS</a>
Ad: Text for the ad
                                                    `,
                                    parse_mode: "HTML",
                                    reply_markup: {
                                        inline_keyboard: [
                                            [
                                                {
                                                    text: "Promote Your Token", callback_data: "button_promote"
                                                },
                                                {
                                                    text: "Trending", callback_data: "button_trending"
                                                }
                                            ]
                                        ]
                                    }
                                });
                            })

                        }

                    } catch (err) {
                        console.error('Error fetching transactions:', err);
                    }
                }, 5000);

            }

        }
    );
    // busy = false
}

