"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateGroupBalances = void 0;
const calculateGroupBalances = (members, expenses, settlements) => {
    const memberMap = new Map();
    const balances = new Map();
    // Initialize member tracking
    members.forEach((m) => {
        const idStr = m._id.toString();
        memberMap.set(idStr, { name: m.name, email: m.email });
        balances.set(idStr, { totalPaid: 0, totalShare: 0, netBalance: 0 });
    });
    // 1. Process Expenses
    expenses.forEach((exp) => {
        const paidById = exp.paidBy.toString();
        const amount = exp.amount; // in paise
        // Add to paidBy total
        if (balances.has(paidById)) {
            const b = balances.get(paidById);
            b.totalPaid += amount;
            b.netBalance += amount;
        }
        // Subtract from participants share
        exp.participants.forEach((p) => {
            const pId = p.user.toString();
            const share = p.amountOwed; // in paise
            if (balances.has(pId)) {
                const b = balances.get(pId);
                b.totalShare += share;
                b.netBalance -= share;
            }
        });
    });
    // 2. Process Completed Settlements
    settlements.forEach((s) => {
        if (s.status !== 'completed')
            return;
        const fromId = s.fromUser.toString();
        const toId = s.toUser.toString();
        const amt = s.amount; // in paise
        // Payer's net balance increases (paying off debt)
        if (balances.has(fromId)) {
            const b = balances.get(fromId);
            b.netBalance += amt;
        }
        // Recipient's net balance decreases (receiving payment)
        if (balances.has(toId)) {
            const b = balances.get(toId);
            b.netBalance -= amt;
        }
    });
    // Compile user balance list
    const userBalanceList = [];
    balances.forEach((val, userId) => {
        const memberInfo = memberMap.get(userId) || { name: 'Unknown User', email: '' };
        userBalanceList.push({
            userId,
            userName: memberInfo.name,
            email: memberInfo.email,
            totalPaid: val.totalPaid,
            totalShare: val.totalShare,
            netBalance: val.netBalance,
        });
    });
    // 3. Minimum Debt Simplification Algorithm (Greedy)
    const creditors = [];
    const debtors = [];
    balances.forEach((val, userId) => {
        if (val.netBalance > 0) {
            creditors.push({ id: userId, amount: val.netBalance });
        }
        else if (val.netBalance < 0) {
            debtors.push({ id: userId, amount: Math.abs(val.netBalance) });
        }
    });
    // Sort creditors (largest owed first) and debtors (largest debt first)
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);
    const simplifiedTransactions = [];
    let i = 0; // debtor pointer
    let j = 0; // creditor pointer
    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const transfer = Math.min(debtor.amount, creditor.amount);
        if (transfer > 0) {
            const debtorInfo = memberMap.get(debtor.id) || { name: 'Unknown', email: '' };
            const creditorInfo = memberMap.get(creditor.id) || { name: 'Unknown', email: '' };
            simplifiedTransactions.push({
                fromUser: { _id: debtor.id, name: debtorInfo.name, email: debtorInfo.email },
                toUser: { _id: creditor.id, name: creditorInfo.name, email: creditorInfo.email },
                amount: transfer,
            });
            debtor.amount -= transfer;
            creditor.amount -= transfer;
        }
        if (debtor.amount === 0)
            i++;
        if (creditor.amount === 0)
            j++;
    }
    return {
        userBalances: userBalanceList,
        simplifiedTransactions,
    };
};
exports.calculateGroupBalances = calculateGroupBalances;
