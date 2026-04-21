/**
 * Migration: Add settings columns to users table
 * Run: node scripts/migrate-settings.mjs
 */
import mysql from "mysql2/promise";

const migrations = [
  `ALTER TABLE \`users\` ADD \`formatHabit\` varchar(32) DEFAULT 'markdown'`,
  `ALTER TABLE \`users\` ADD \`encryptedApiKeys\` text`,
  `ALTER TABLE \`users\` ADD \`displayName\` varchar(128)`,
  `ALTER TABLE \`users\` ADD \`plan\` enum('free','pro') DEFAULT 'free' NOT NULL`,
  `ALTER TABLE \`users\` ADD \`stripeCustomerId\` varchar(64)`,
  `ALTER TABLE \`users\` ADD \`stripeSubscriptionId\` varchar(64)`,
];

const conn = await mysql.createConnection(process.env.DATABASE_URL);

for (const sql of migrations) {
  const col = sql.match(/ADD `(\w+)`/)?.[1] ?? sql;
  try {
    await conn.execute(sql);
    console.log(`✓ ${col}`);
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME") {
      console.log(`⏭  ${col} (already exists)`);
    } else {
      console.error(`✗ ${col}: ${e.message}`);
      process.exit(1);
    }
  }
}

await conn.end();
console.log("Migration complete.");
