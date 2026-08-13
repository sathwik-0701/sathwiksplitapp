"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const balanceCalculator_1 = require("../utils/balanceCalculator");
console.log('===========================================================');
console.log('🧪 RUNNING EXPENSE SPLIT & DEBT SIMPLIFICATION ALGORITHM TESTS');
console.log('===========================================================\n');
let passedTests = 0;
let totalTests = 0;
const assert = (condition, testName) => {
    totalTests++;
    if (condition) {
        console.log(`✅ PASS: ${testName}`);
        passedTests++;
    }
    else {
        console.error(`❌ FAIL: ${testName}`);
    }
};
// -------------------------------------------------------------
// Test 1: 2 Members — Simple debt (One paid everything)
// -------------------------------------------------------------
(() => {
    const members = [
        { _id: 'u1', name: 'Arun', email: 'arun@test.com' },
        { _id: 'u2', name: 'Ravi', email: 'ravi@test.com' },
    ];
    // Arun paid ₹200 (20000 paise) for equal split
    const expenses = [
        {
            paidBy: 'u1',
            amount: 20000,
            participants: [
                { user: 'u1', amountOwed: 10000 },
                { user: 'u2', amountOwed: 10000 },
            ],
        },
    ];
    const res = (0, balanceCalculator_1.calculateGroupBalances)(members, expenses, []);
    assert(res.simplifiedTransactions.length === 1, '2 Members: Creates 1 transaction');
    assert(res.simplifiedTransactions[0].fromUser._id === 'u2', '2 Members: Ravi owes money');
    assert(res.simplifiedTransactions[0].toUser._id === 'u1', '2 Members: Ravi owes Arun');
    assert(res.simplifiedTransactions[0].amount === 10000, '2 Members: Amount is 10000 paise (₹100)');
})();
// -------------------------------------------------------------
// Test 2: 4 Members — Prompt Example Scenario
// Arun paid ₹4000 (400000 paise), Ravi paid ₹1000 (100000 paise), Sita paid ₹500 (50000 paise), Kumar paid ₹0
// Total = ₹5500 (550000 paise). Equal share = ₹1375 (137500 paise)
// Expected Balances: Arun +262500, Ravi -37500, Sita -87500, Kumar -137500
// Minimum Transactions: Kumar->Arun 137500, Sita->Arun 87500, Ravi->Arun 37500
// -------------------------------------------------------------
(() => {
    const members = [
        { _id: 'arun', name: 'Arun', email: 'arun@test.com' },
        { _id: 'ravi', name: 'Ravi', email: 'ravi@test.com' },
        { _id: 'sita', name: 'Sita', email: 'sita@test.com' },
        { _id: 'kumar', name: 'Kumar', email: 'kumar@test.com' },
    ];
    const expenses = [
        // Arun paid 400000
        {
            paidBy: 'arun',
            amount: 400000,
            participants: members.map((m) => ({ user: m._id, amountOwed: 100000 })),
        },
        // Ravi paid 100000
        {
            paidBy: 'ravi',
            amount: 100000,
            participants: members.map((m) => ({ user: m._id, amountOwed: 25000 })),
        },
        // Sita paid 50000
        {
            paidBy: 'sita',
            amount: 50000,
            participants: members.map((m) => ({ user: m._id, amountOwed: 12500 })),
        },
    ];
    const res = (0, balanceCalculator_1.calculateGroupBalances)(members, expenses, []);
    assert(res.simplifiedTransactions.length === 3, '4 Members Prompt Example: Reduced to 3 minimum transactions');
    const arunTotalReceived = res.simplifiedTransactions
        .filter((t) => t.toUser._id === 'arun')
        .reduce((sum, t) => sum + t.amount, 0);
    assert(arunTotalReceived === 262500, '4 Members Prompt Example: Arun receives exact net balance of +₹2625 (262500 paise)');
})();
// -------------------------------------------------------------
// Test 3: 10+ Members Scalability & Zero Balance check
// -------------------------------------------------------------
(() => {
    const members = Array.from({ length: 12 }, (_, idx) => ({
        _id: `user_${idx + 1}`,
        name: `User ${idx + 1}`,
        email: `user${idx + 1}@test.com`,
    }));
    // User 1 paid ₹12000 (1200000 paise) split among all 12 users equally (100000 paise each)
    const expenses = [
        {
            paidBy: 'user_1',
            amount: 1200000,
            participants: members.map((m) => ({ user: m._id, amountOwed: 100000 })),
        },
    ];
    const res = (0, balanceCalculator_1.calculateGroupBalances)(members, expenses, []);
    assert(res.simplifiedTransactions.length === 11, '12 Members: 11 debtors pay 1 creditor');
    const totalTransferred = res.simplifiedTransactions.reduce((acc, t) => acc + t.amount, 0);
    assert(totalTransferred === 1100000, '12 Members: Total transferred equals sum of 11 debtors shares (1100000 paise)');
})();
// -------------------------------------------------------------
// Test 4: Settlement Settlement Adjustment
// -------------------------------------------------------------
(() => {
    const members = [
        { _id: 'u1', name: 'User 1', email: 'u1@test.com' },
        { _id: 'u2', name: 'User 2', email: 'u2@test.com' },
    ];
    const expenses = [
        {
            paidBy: 'u1',
            amount: 10000,
            participants: [
                { user: 'u1', amountOwed: 5000 },
                { user: 'u2', amountOwed: 5000 },
            ],
        },
    ];
    // User 2 pays User 1 5000 paise in settlement
    const settlements = [
        {
            fromUser: 'u2',
            toUser: 'u1',
            amount: 5000,
            status: 'completed',
        },
    ];
    const res = (0, balanceCalculator_1.calculateGroupBalances)(members, expenses, settlements);
    assert(res.simplifiedTransactions.length === 0, 'Settlement test: Fully settled group produces 0 transactions');
})();
console.log(`\n🎉 Test Results: ${passedTests}/${totalTests} tests passed successfully!\n`);
