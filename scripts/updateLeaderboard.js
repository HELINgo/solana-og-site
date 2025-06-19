"use strict";
// scripts/updateLeaderboard.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_1 = require("@supabase/supabase-js");
// 替换成你自己的 Supabase 项目信息
var supabase = (0, supabase_js_1.createClient)('https://vpinbblavyiryvdoyvsn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW5iYmxhdnlpcnl2ZG95dnNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1NjY3MiwiZXhwIjoyMDY0ODMyNjcyfQ.xAyrtOMFy1-AmDa2ffR8GzccjugnJ0P3LtIPi0qK7Jk');
// 从 Twitter 链接中提取用户名
var extractHandle = function (url) {
    var match = url.match(/x\.com\/([^\/]+)/);
    return match ? match[1] : null;
};
// 模拟热度：可替换为真实 Twitter API 获取
var getMockHeat = function (handle) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, Math.floor(Math.random() * 10000 + 5000)]; // 模拟热度值
    });
}); };
// 更新一个表（token_leaderboard 或 nft_leaderboard）
var updateLeaderboard = function (table) { return __awaiter(void 0, void 0, void 0, function () {
    var data, _i, data_1, item, handle, heat;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, supabase.from(table).select('*')];
            case 1:
                data = (_a.sent()).data;
                if (!data)
                    return [2 /*return*/];
                _i = 0, data_1 = data;
                _a.label = 2;
            case 2:
                if (!(_i < data_1.length)) return [3 /*break*/, 6];
                item = data_1[_i];
                handle = extractHandle(item.twitter);
                if (!handle)
                    return [3 /*break*/, 5];
                return [4 /*yield*/, getMockHeat(handle)];
            case 3:
                heat = _a.sent();
                return [4 /*yield*/, supabase.from(table).update({ heat: heat }).eq('name', item.name)];
            case 4:
                _a.sent();
                console.log("[".concat(table, "] ").concat(item.name, " \u70ED\u5EA6\u66F4\u65B0\u4E3A ").concat(heat));
                _a.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 2];
            case 6: return [2 /*return*/];
        }
    });
}); };
// 主函数
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, updateLeaderboard('token_leaderboard')];
            case 1:
                _a.sent();
                return [4 /*yield*/, updateLeaderboard('nft_leaderboard')];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
