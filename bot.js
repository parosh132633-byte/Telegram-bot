const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');

// আপনার টেলিগ্রাম বোট টোকেন ও অ্যাডমিন আইডি
const token = '8916440491:AAGOulX5Ft0MEC0xqdJkQGG6lBmBGHctz4I';
const adminId = 6873530282;

const bot = new TelegramBot(token, { polling: true });

// ফায়ারবেস অ্যাডমিন ইনিশিয়ালাইজেশন
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "ssc-result-1ee7b",
    clientEmail: "firebase-adminsdk-91734-ssc-result-1ee7b.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
  }),
  databaseURL: "https://ssc-result-1ee7b-default-rtdb.firebaseio.com"
});

const db = admin.database();

// টেম্পোরারি স্টেট স্টোর করার জন্য (কোন অ্যাডমিন কী আপডেট করতে চাচ্ছে তা বোঝার জন্য)
const userState = {};

// ১. /start কমান্ড দিলে মূল মেনু বা বাটনগুলো দেখাবে
bot.onText(/\/start/, (msg) => {
    if (msg.from.id !== adminId) return;

    const menuOptions = {
        reply_markup: {
            inline_keyboard: [
                [{ text: "📅 কাউন্টডাউন ডেট পরিবর্তন", callback_data: "btn_setdate" }],
                [{ text: "🔗 রেজাল্ট লিংক পরিবর্তন", callback_data: "btn_setlink" }],
                [{ text: "📌 টাইটেল পরিবর্তন", callback_data: "btn_settitle" }],
                [{ text: "📢 নোটিশ পরিবর্তন", callback_data: "btn_setnotice" }]
            ]
        }
    };

    bot.sendMessage(adminId, "🤖 **SSC Result Control Panel**\n\nনিচের অপশনগুলো থেকে যেকোনো একটি সিলেক্ট করুন:", { parse_mode: "Markdown", ...menuOptions });
});

// ২. বাটনে ক্লিক করলে ইউজারের স্টেট পরিবর্তন হবে
bot.on('callback_query', (query) => {
    if (query.from.id !== adminId) return;

    const chatId = query.message.chat.id;
    const action = query.data;

    if (action === "btn_setdate") {
        userState[adminId] = "waiting_for_date";
        bot.sendMessage(chatId, "⏳ নতুন কাউন্টডাউন ডেট লিখে পাঠান (যেমন: `2026-08-15`):", { parse_mode: "Markdown" });
    } else if (action === "btn_setlink") {
        userState[adminId] = "waiting_for_link";
        bot.sendMessage(chatId, "🔗 নতুন রেজাল্ট লিংক লিখে পাঠান:", { parse_mode: "Markdown" });
    } else if (action === "btn_settitle") {
        userState[adminId] = "waiting_for_title";
        bot.sendMessage(chatId, "📌 নতুন টাইটেল লিখে পাঠান:", { parse_mode: "Markdown" });
    } else if (action === "btn_setnotice") {
        userState[adminId] = "waiting_for_notice";
        bot.sendMessage(chatId, "📢 নতুন নোটিশ লিখে পাঠান:", { parse_mode: "Markdown" });
    }

    bot.answerCallbackQuery(query.id);
});

// ৩. ইউজার যা লিখে পাঠাবে তা স্টেটের ওপর ভিত্তি করে ফায়ারবেসে আপডেট হবে
bot.on('message', (msg) => {
    if (msg.from.id !== adminId) return;
    if (!msg.text || msg.text.startsWith('/')) return; // কমান্ড ইগনোর করবে

    const chatId = msg.chat.id;
    const text = msg.text;
    const state = userState[adminId];

    if (!state) return;

    if (state === "waiting_for_date") {
        db.ref('appSettings/').update({ targetDate: text }, (err) => {
            if (err) bot.sendMessage(chatId, "❌ কাউন্টডাউন আপডেট করতে সমস্যা হয়েছে।");
            else bot.sendMessage(chatId, `✅ সফলভাবে কাউন্টডাউন ডেট পরিবর্তন করা হয়েছে:\n${text}`);
            delete userState[adminId];
        });
    } else if (state === "waiting_for_link") {
        db.ref('appSettings/').update({ resultUrl: text }, (err) => {
            if (err) bot.sendMessage(chatId, "❌ লিংক আপডেট করতে সমস্যা হয়েছে।");
            else bot.sendMessage(chatId, `✅ সফলভাবে রেজাল্ট লিংক পরিবর্তন করা হয়েছে:\n${text}`);
            delete userState[adminId];
        });
    } else if (state === "waiting_for_title") {
        db.ref('appSettings/').update({ title: text }, (err) => {
            if (err) bot.sendMessage(chatId, "❌ টাইটেল আপডেট করতে সমস্যা হয়েছে।");
            else bot.sendMessage(chatId, `✅ সফলভাবে অ্যাপের টাইটেল পরিবর্তন করা হয়েছে:\n${text}`);
            delete userState[adminId];
        });
    } else if (state === "waiting_for_notice") {
        db.ref('appSettings/').update({ notice: text }, (err) => {
            if (err) bot.sendMessage(chatId, "❌ নোটিশ আপডেট করতে সমস্যা হয়েছে।");
            else bot.sendMessage(chatId, `✅ সফলভাবে নোটিশ পরিবর্তন করা হয়েছে:\n${text}`);
            delete userState[adminId];
        });
    }
});

console.log("🤖 মেনু বারসহ টেলিগ্রাম কন্ট্রোল বোট সফলভাবে চালু হয়েছে...");
