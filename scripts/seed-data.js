import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedData() {
  try {
    // Insert sample customers
    console.log('Seeding customers...');
    
    const customers = [
      {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@email.com',
        phone: '+91-9876543210',
        totalSpent: 15000.00,
        visitCount: 8,
        lastPurchaseDate: new Date('2024-11-15'),
        customerSince: new Date('2024-01-15'),
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@email.com',
        phone: '+91-9876543211',
        totalSpent: 25000.00,
        visitCount: 15,
        lastPurchaseDate: new Date('2024-12-01'),
        customerSince: new Date('2023-08-20'),
      },
      {
        name: 'Amit Kumar',
        email: 'amit.kumar@email.com',
        phone: '+91-9876543212',
        totalSpent: 8500.00,
        visitCount: 4,
        lastPurchaseDate: new Date('2024-10-05'),
        customerSince: new Date('2024-05-10'),
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@email.com',
        phone: '+91-9876543213',
        totalSpent: 32000.00,
        visitCount: 22,
        lastPurchaseDate: new Date('2024-12-10'),
        customerSince: new Date('2023-03-12'),
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@email.com',
        phone: '+91-9876543214',
        totalSpent: 5500.00,
        visitCount: 2,
        lastPurchaseDate: new Date('2024-08-25'),
        customerSince: new Date('2024-07-01'),
      },
      {
        name: 'Anita Gupta',
        email: 'anita.gupta@email.com',
        phone: '+91-9876543215',
        totalSpent: 18750.00,
        visitCount: 12,
        lastPurchaseDate: new Date('2024-11-28'),
        customerSince: new Date('2023-11-05'),
      },
      {
        name: 'Raj Mehta',
        email: 'raj.mehta@email.com',
        phone: '+91-9876543216',
        totalSpent: 45000.00,
        visitCount: 35,
        lastPurchaseDate: new Date('2024-12-05'),
        customerSince: new Date('2022-12-01'),
      },
      {
        name: 'Kavita Joshi',
        email: 'kavita.joshi@email.com',
        phone: '+91-9876543217',
        totalSpent: 12300.00,
        visitCount: 7,
        lastPurchaseDate: new Date('2024-09-15'),
        customerSince: new Date('2024-02-20'),
      },
      {
        name: 'Deepak Agarwal',
        email: 'deepak.agarwal@email.com',
        phone: '+91-9876543218',
        totalSpent: 28900.00,
        visitCount: 18,
        lastPurchaseDate: new Date('2024-11-20'),
        customerSince: new Date('2023-06-10'),
      },
      {
        name: 'Ritu Sharma',
        email: 'ritu.sharma@email.com',
        phone: '+91-9876543219',
        totalSpent: 3200.00,
        visitCount: 1,
        lastPurchaseDate: new Date('2024-06-12'),
        customerSince: new Date('2024-06-12'),
      }
    ];

    for (const customer of customers) {
      await pool.query(`
        INSERT INTO customers (name, email, phone, total_spent, visit_count, last_purchase_date, customer_since)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO NOTHING
      `, [
        customer.name,
        customer.email,
        customer.phone,
        customer.totalSpent,
        customer.visitCount,
        customer.lastPurchaseDate,
        customer.customerSince
      ]);
    }

    // Insert sample orders
    console.log('Seeding orders...');
    
    const orders = [
      { customerId: 1, amount: 2500.00, orderDate: new Date('2024-11-15') },
      { customerId: 1, amount: 1800.00, orderDate: new Date('2024-10-20') },
      { customerId: 2, amount: 3200.00, orderDate: new Date('2024-12-01') },
      { customerId: 2, amount: 2800.00, orderDate: new Date('2024-11-15') },
      { customerId: 3, amount: 4200.00, orderDate: new Date('2024-10-05') },
      { customerId: 4, amount: 5500.00, orderDate: new Date('2024-12-10') },
      { customerId: 4, amount: 3800.00, orderDate: new Date('2024-11-25') },
      { customerId: 5, amount: 2200.00, orderDate: new Date('2024-08-25') },
      { customerId: 6, amount: 3600.00, orderDate: new Date('2024-11-28') },
      { customerId: 7, amount: 8900.00, orderDate: new Date('2024-12-05') },
      { customerId: 7, amount: 6700.00, orderDate: new Date('2024-11-18') },
      { customerId: 8, amount: 4800.00, orderDate: new Date('2024-09-15') },
      { customerId: 9, amount: 7200.00, orderDate: new Date('2024-11-20') },
      { customerId: 10, amount: 3200.00, orderDate: new Date('2024-06-12') }
    ];

    for (const order of orders) {
      await pool.query(`
        INSERT INTO orders (customer_id, amount, order_date)
        VALUES ($1, $2, $3)
      `, [order.customerId, order.amount, order.orderDate]);
    }

    console.log('Database seeded successfully!');
    
    // Show summary
    const customerCount = await pool.query('SELECT COUNT(*) FROM customers');
    const orderCount = await pool.query('SELECT COUNT(*) FROM orders');
    
    console.log(`Created ${customerCount.rows[0].count} customers`);
    console.log(`Created ${orderCount.rows[0].count} orders`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedData();