const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');

// আপনার টেলিগ্রাম বোট টোকেন ও অ্যাডমিন আইডি
const token = '8916440491:AAGOulX5Ft0MEC0xqdJkQGG6lBmBGHctz4I';
const adminId = 6873530282;

const bot = new TelegramBot(token, { polling: true });

// ফায়ারবেস অ্যাডমিন ইনিশিয়ালাইজেশন (আপনার দেওয়া ফায়ারবেস প্রজেক্টের তথ্য অনুযায়ী)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "ssc-result-1ee7b",
    clientEmail: "firebase-adminsdk-91734-ssc-result-1ee7b.iam.gserviceaccount.com", // আপনার ফায়ারবেস সার্ভিস ইমেইল
    privateKey: "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n" // আপনার ফায়ারবেসের প্রাইভেট কি
  }),
  databaseURL: "https://ssc-result-1ee7b-default-rtdb.firebaseio.com"
});

const db = admin.database();

// ১. কাউন্টডাউন ডেট পরিবর্তন করার কমান্ড
bot.onText(/\/setdate (.+)/, (msg, match) => {
    if (msg.from.id !== adminId) return;
    const newDate = match[1];
    db.ref('appSettings/').update({ targetDate: newDate }, (err) => {
        if (err) {
            bot.sendMessage(adminId, "❌ কাউন্টডাউন আপডেট করতে সমস্যা হয়েছে।");
        } else {
            bot.sendMessage(adminId, `✅ সফলভাবে কাউন্টডাউন ডেট পরিবর্তন করা হয়েছে:\n${newDate}`);
        }
    });
});

// ২. রেজাল্ট দেখার লিংক পরিবর্তনের কমান্ড
bot.onText(/\/setlink (.+)/, (msg, match) => {
    if (msg.from.id !== adminId) return;
    const newLink = match[1];
    db.ref('appSettings/').update({ resultUrl: newLink }, (err) => {
        if (err) {
            bot.sendMessage(adminId, "❌ লিংক আপডেট করতে সমস্যা হয়েছে।");
        } else {
            bot.sendMessage(adminId, `✅ সফলভাবে রেজাল্ট লিংক পরিবর্তন করা হয়েছে:\n${newLink}`);
        }
    });
});

// ৩. অ্যাপের শিরোনাম (Title) পরিবর্তনের কমান্ড
bot.onText(/\/settitle (.+)/, (msg, match) => {
    if (msg.from.id !== adminId) return;
    const newTitle = match[1];
    db.ref('appSettings/').update({ title: newTitle }, (err) => {
        if (err) {
            bot.sendMessage(adminId, "❌ টাইটেল আপডেট করতে সমস্যা হয়েছে।");
        } else {
            bot.sendMessage(adminId, `✅ সফলভাবে অ্যাপের টাইটেল পরিবর্তন করা হয়েছে:\n${newTitle}`);
        }
    });
});

// ৪. নোটিশ বা সাব-টাইটেল পরিবর্তনের কমান্ড
bot.onText(/\/setnotice (.+)/, (msg, match) => {
    if (msg.from.id !== adminId) return;
    const newNotice = match[1];
    db.ref('appSettings/').update({ notice: newNotice }, (err) => {
        if (err) {
            bot.sendMessage(adminId, "❌ নোটিশ আপডেট করতে সমস্যা হয়েছে।");
        } else {
            bot.sendMessage(adminId, `✅ সফলভাবে নোটিশ পরিবর্তন করা হয়েছে:\n${newNotice}`);
        }
    });
});

console.log("🤖 টেলিগ্রাম কন্ট্রোল বোট সফলভাবে চালু হয়েছে এবং ফায়ারবেসের সাথে যুক্ত রয়েছে...");
