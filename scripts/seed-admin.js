const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const password = 'admin123'; // Contraseña del admin
const email = 'admin@logistics.com';
const name = 'Admin User';

async function generateHash() {
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();
  const now = new Date().toISOString();

  console.log('\n=== SQL Script ===\n');
  console.log(`INSERT INTO users (id, name, email, password, phone, role, status, "createdAt", "updatedAt")
VALUES (
  '${userId}',
  '${name}',
  '${email}',
  '${hashedPassword}',
  NULL,
  'admin',
  'active',
  '${now}',
  '${now}'
);\n`);

  console.log('=== Credentials ===');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}\n`);
}

generateHash().catch(console.error);
