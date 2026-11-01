const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function getMonthString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

async function main() {
  console.log('Clearing existing data...');
  await prisma.transaction.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.investment.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('demo1234', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Rohit Kumar',
      email: 'demo@finora.app',
      passwordHash,
      accounts: {
        create: [
          { name: 'HDFC Wealth Checking', type: 'BANK', balance: 54700000 },
          { name: 'ICICI Savings & Emergency', type: 'BANK', balance: 45000000 },
          { name: 'Zerodha Equity & SGB', type: 'WALLET', balance: 68500000 },
        ],
      },
    },
    include: { accounts: true },
  });

  const primaryAccount = user.accounts[0];
  const uid = user.id;
  const aid = primaryAccount.id;

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();

  console.log(`Seeding realistic financial activity up to ${now.toISOString()}...`);

  const txData = [];

  // Seed 5 months of rich financial history leading to current month
  for (let offset = 4; offset >= 0; offset--) {
    const monthDate = new Date(curYear, curMonth - offset, 1);
    const y = monthDate.getFullYear();
    const m = monthDate.getMonth();

    // 1. Monthly Salary (always on the 1st)
    txData.push({
      userId: uid,
      accountId: aid,
      type: 'INCOME',
      amount: 25000000, // ₹2,50,000
      category: 'Salary',
      description: 'Monthly Executive Payroll - Tech Systems Ltd',
      merchant: 'Tech Systems India',
      date: new Date(y, m, 1, 9, 30),
      paymentMethod: 'NET_BANKING',
    });

    // 2. Consulting / Dividend (mid-month)
    if (offset % 2 === 0) {
      txData.push({
        userId: uid,
        accountId: aid,
        type: 'INCOME',
        amount: 4500000, // ₹45,000
        category: 'Freelance & Consulting',
        description: 'Q3 Architectural Advisory Retainer',
        merchant: 'Finova Labs Inc',
        date: new Date(y, m, 15, 14, 0),
        paymentMethod: 'NET_BANKING',
      });
    }

    // 3. Rent
    txData.push({
      userId: uid,
      accountId: aid,
      type: 'EXPENSE',
      amount: 4500000, // ₹45,000
      category: 'Housing',
      description: 'Monthly Apartment Lease',
      merchant: 'DLF CyberCity Properties',
      date: new Date(y, m, 3, 11, 0),
      paymentMethod: 'NET_BANKING',
    });

    // 4. Groceries (twice a month)
    txData.push({
      userId: uid,
      accountId: aid,
      type: 'EXPENSE',
      amount: 785000, // ₹7,850
      category: 'Food & Dining',
      description: 'Monthly Organic Groceries & Pantry',
      merchant: "Nature's Basket",
      date: new Date(y, m, 6, 17, 20),
      paymentMethod: 'UPI',
    });
    txData.push({
      userId: uid,
      accountId: aid,
      type: 'EXPENSE',
      amount: 342000, // ₹3,420
      category: 'Food & Dining',
      description: 'Fresh Produce & Daily Essentials',
      merchant: 'Blinkit',
      date: new Date(y, m, 20, 19, 45),
      paymentMethod: 'UPI',
    });

    // 5. Dining & Cafes
    txData.push({
      userId: uid,
      accountId: aid,
      type: 'EXPENSE',
      amount: 280000, // ₹2,800
      category: 'Food & Dining',
      description: 'Dinner & Tasting Menu',
      merchant: 'The Bombay Canteen',
      date: new Date(y, m, 12, 21, 30),
      paymentMethod: 'CARD',
    });
    txData.push({
      userId: uid,
      accountId: aid,
      type: 'EXPENSE',
      amount: 85000, // ₹850
      category: 'Food & Dining',
      description: 'Specialty Cold Brew & Beans',
      merchant: 'Blue Tokai Coffee',
      date: new Date(y, m, 18, 10, 15),
      paymentMethod: 'UPI',
    });

    // 6. Utilities & Tech
    txData.push({
      userId: uid,
      accountId: aid,
      type: 'EXPENSE',
      amount: 385000, // ₹3,850
      category: 'Utilities',
      description: 'Electricity & Green Energy Utility',
      merchant: 'Tata Power Mumbai',
      date: new Date(y, m, 8, 12, 0),
      paymentMethod: 'UPI',
    });
    txData.push({
      userId: uid,
      accountId: aid,
      type: 'EXPENSE',
      amount: 149900, // ₹1,499
      category: 'Utilities',
      description: 'Gigabit Fiber Internet Subscription',
      merchant: 'Airtel Broadband',
      date: new Date(y, m, 10, 8, 30),
      paymentMethod: 'UPI',
    });

    // 7. Shopping & Lifestyle
    txData.push({
      userId: uid,
      accountId: aid,
      type: 'EXPENSE',
      amount: 649000, // ₹6,490
      category: 'Shopping',
      description: 'Minimalist Wardrobe Essentials',
      merchant: 'Uniqlo India',
      date: new Date(y, m, 16, 16, 40),
      paymentMethod: 'CARD',
    });

    // 8. Health & Fitness
    txData.push({
      userId: uid,
      accountId: aid,
      type: 'EXPENSE',
      amount: 350000, // ₹3,500
      category: 'Health & Wellness',
      description: 'Cult.fit Elite Monthly Membership',
      merchant: 'Cult.fit',
      date: new Date(y, m, 5, 7, 0),
      paymentMethod: 'UPI',
    });
  }

  // Insert all transactions
  for (const t of txData) {
    await prisma.transaction.create({ data: t });
  }

  // Seed Budgets for current month and previous month
  const currentMonthStr = getMonthString(now);
  const prevMonthStr = getMonthString(new Date(curYear, curMonth - 1, 1));

  const budgetConfigs = [
    { category: 'Housing', limitAmount: 5000000 },
    { category: 'Food & Dining', limitAmount: 2500000 },
    { category: 'Shopping', limitAmount: 2000000 },
    { category: 'Utilities', limitAmount: 1000000 },
    { category: 'Health & Wellness', limitAmount: 800000 },
  ];

  for (const b of budgetConfigs) {
    await prisma.budget.create({
      data: {
        userId: uid,
        category: b.category,
        month: currentMonthStr,
        limitAmount: b.limitAmount,
      },
    });
    await prisma.budget.create({
      data: {
        userId: uid,
        category: b.category,
        month: prevMonthStr,
        limitAmount: b.limitAmount,
      },
    });
  }

  // Seed Wealth & Investments
  await prisma.investment.createMany({
    data: [
      {
        userId: uid,
        assetName: 'Nifty 50 Index Fund Direct Growth',
        symbol: 'NIFTY50',
        assetType: 'MUTUAL_FUND',
        quantity: 140,
        purchasePrice: 185000, // ₹1,850
        currentPrice: 224000,  // ₹2,240
        purchaseDate: new Date(curYear - 1, 3, 15),
      },
      {
        userId: uid,
        assetName: 'Parag Parikh Flexi Cap Fund',
        symbol: 'PPFAS',
        assetType: 'MUTUAL_FUND',
        quantity: 95,
        purchasePrice: 56000,  // ₹560
        currentPrice: 71500,   // ₹715
        purchaseDate: new Date(curYear - 1, 6, 20),
      },
      {
        userId: uid,
        assetName: 'Sovereign Gold Bonds Series IV',
        symbol: 'SGB2024',
        assetType: 'GOLD',
        quantity: 30,
        purchasePrice: 620000, // ₹6,200
        currentPrice: 755000,  // ₹7,550
        purchaseDate: new Date(curYear, 1, 10),
      },
      {
        userId: uid,
        assetName: 'Apple Inc. (AAPL) Global Equity',
        symbol: 'AAPL',
        assetType: 'STOCK',
        quantity: 18,
        purchasePrice: 1520000, // ₹15,200
        currentPrice: 1940000,  // ₹19,400
        purchaseDate: new Date(curYear - 1, 9, 5),
      },
    ],
  });

  // Seed Financial Goals
  await prisma.goal.createMany({
    data: [
      {
        userId: uid,
        name: 'Emergency Fund (6 Months Liquid)',
        targetAmount: 60000000, // ₹6,00,000
        savedAmount: 45000000,  // ₹4,50,000
        monthlyContribution: 2500000, // ₹25,000
        deadline: new Date(curYear + 1, 2, 31),
      },
      {
        userId: uid,
        name: 'New M3 Max Studio Workstation',
        targetAmount: 28000000, // ₹2,80,000
        savedAmount: 21000000,  // ₹2,10,000
        monthlyContribution: 2000000, // ₹20,000
        deadline: new Date(curYear, curMonth + 3, 15),
      },
      {
        userId: uid,
        name: 'Kyoto & Tokyo Autumn Journey',
        targetAmount: 35000000, // ₹3,50,000
        savedAmount: 14000000,  // ₹1,40,000
        monthlyContribution: 3000000, // ₹30,000
        deadline: new Date(curYear + 1, 9, 20),
      },
    ],
  });

  // Seed Subscriptions
  await prisma.subscription.createMany({
    data: [
      {
        userId: uid,
        name: 'Netflix 4K Ultra HD Family',
        price: 64900,
        billingCycle: 'MONTHLY',
        nextPayment: new Date(curYear, curMonth, 28),
        category: 'Entertainment',
        active: true,
      },
      {
        userId: uid,
        name: 'Spotify Premium Duo',
        price: 14900,
        billingCycle: 'MONTHLY',
        nextPayment: new Date(curYear, curMonth, 14),
        category: 'Entertainment',
        active: true,
      },
      {
        userId: uid,
        name: 'GitHub Copilot Enterprise',
        price: 85000,
        billingCycle: 'MONTHLY',
        nextPayment: new Date(curYear, curMonth, 22),
        category: 'Work & Software',
        active: true,
      },
      {
        userId: uid,
        name: 'AWS Cloud Hosting & Storage',
        price: 320000,
        billingCycle: 'MONTHLY',
        nextPayment: new Date(curYear, curMonth, 2),
        category: 'Work & Software',
        active: true,
      },
    ],
  });

  console.log('✓ Successfully seeded rich, realistic fintech data for Rohit Kumar.');
  console.log('Demo login: demo@finora.app / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
