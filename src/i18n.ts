import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 获取本地保存的语言，如果没有，则默认使用英文
const savedLanguage = localStorage.getItem('i18nextLng') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    zh: {
      translation: {
        "title": "🎉 上一轮中奖结果",
        "back": "返回主页",
        "pool": "🏆 当前奖池：",
        "wallet": "🪙 钱包余额：",
        "countdown": "⏳ 距开奖：",
        "buy_now": "🎟 立即购买彩票刮刮卡",
        "buying": "购买中...",
        "buy_quantity": "🎯 购买数量（最多10）：",
        "bind_x": "绑定你的 X 账号：",
        "bind_success": "✅ 已绑定 X：",
        "bind_btn": "绑定",
      },
    },
    en: {
      translation: {
        "title": "🎉 Last Round Result",
        "back": "Back to Home",
        "pool": "🏆 Current Pool:",
        "wallet": "🪙 Wallet Balance:",
        "countdown": "⏳ Time Left:",
        "buy_now": "🎟 Buy Lottery Now",
        "buying": "Buying...",
        "buy_quantity": "🎯 Tickets to Buy (max 10):",
        "bind_x": "Bind your X handle:",
        "bind_success": "✅ Bound X:",
        "bind_btn": "Bind",
      },
    },
  },
  lng: savedLanguage, // 使用本地保存的语言或默认英文
  fallbackLng: 'en',  // 兜底语言为英文
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

