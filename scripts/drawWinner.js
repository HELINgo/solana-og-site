"use strict";
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
var web3_js_1 = require("@solana/web3.js");
var supabase_js_1 = require("@supabase/supabase-js");
var fs_1 = require("fs");
// 1. 连接 Supabase
var supabase = (0, supabase_js_1.createClient)('https://vpinbblavyiryvdoyvsn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW5iYmxhdnlpcnl2ZG95dnNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1NjY3MiwiZXhwIjoyMDY0ODMyNjcyfQ.xAyrtOMFy1-AmDa2ffR8GzccjugnJ0P3LtIPi0qK7Jk' // 注意：此处用的是服务密钥，不是 anon_key
);
// 2. 连接 Solana
var connection = new web3_js_1.Connection('https://api.mainnet-beta.solana.com', 'confirmed');
// 3. 加载程序钱包
var keypair = web3_js_1.Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs_1.default.readFileSync('path/to/your/dev-wallet.json', 'utf8'))));
var devWallet = keypair.publicKey.toBase58();
// 4. 获取当前轮
function getCurrentRoundId() {
    return __awaiter(this, void 0, void 0, function () {
        var now, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = new Date().toISOString();
                    return [4 /*yield*/, supabase
                            .from('lottery_rounds')
                            .select('*')
                            .lte('start_time', now)
                            .gte('end_time', now)
                            .single()];
                case 1:
                    data = (_a.sent()).data;
                    return [2 /*return*/, data];
            }
        });
    });
}
// 5. 执行开奖逻辑
function drawWinner() {
    return __awaiter(this, void 0, void 0, function () {
        var currentRound, entries, winnerEntry, prizeAmount, transaction, sig, now, nextEnd;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getCurrentRoundId()];
                case 1:
                    currentRound = _a.sent();
                    if (!currentRound)
                        return [2 /*return*/, console.log('No active round')];
                    return [4 /*yield*/, supabase
                            .from('lottery_entries')
                            .select('*')
                            .eq('round_id', currentRound.id)];
                case 2:
                    entries = (_a.sent()).data;
                    if (!entries || entries.length === 0)
                        return [2 /*return*/, console.log('No entries')];
                    winnerEntry = entries[Math.floor(Math.random() * entries.length)];
                    prizeAmount = entries.length * 0.01;
                    transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
                        fromPubkey: keypair.publicKey,
                        toPubkey: new web3_js_1.PublicKey(winnerEntry.wallet),
                        lamports: prizeAmount * web3_js_1.LAMPORTS_PER_SOL,
                    }));
                    return [4 /*yield*/, (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [keypair])];
                case 3:
                    sig = _a.sent();
                    console.log("\uD83C\uDF89 Winner: ".concat(winnerEntry.wallet, ", prize: ").concat(prizeAmount, " SOL"));
                    // 保存记录
                    return [4 /*yield*/, supabase.from('lottery_history').insert({
                            wallet: winnerEntry.wallet,
                            amount: prizeAmount,
                            round_id: currentRound.id,
                            ticket_number: winnerEntry.ticket_number,
                            twitter: winnerEntry.twitter,
                        })];
                case 4:
                    // 保存记录
                    _a.sent();
                    now = new Date();
                    nextEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                    return [4 /*yield*/, supabase.from('lottery_rounds').update({ status: 'ended' }).eq('id', currentRound.id)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, supabase.from('lottery_rounds').insert({
                            start_time: now.toISOString(),
                            end_time: nextEnd.toISOString(),
                            status: 'active',
                        })];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
drawWinner().catch(console.error);
