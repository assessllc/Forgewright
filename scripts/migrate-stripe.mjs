/**
 * Migration: Add usage_tracking table for Stripe monetization
 * Run: node scripts/migrate-stripe.mjs
 */
import mysql from "mysql2/promise";

const migrations = [
  `CREATE TABLE IF NOT EXISTS \`usage_tracking\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`userId\` int NOT NULL,
    \`month\` varchar(7) NOT NULL COMMENT 'YYYY-MM format',
    \`sessionCount\` int NOT NULL DEFAULT 0,
    \`lastUpdated\` bigint NOT NULL,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`usage_tracking_userId_month_unique\` (\`userId\`, \`month\`),
    KEY \`usage_tracking_userId_idx\` (\`userId\`)
  )`,
];

const conn = await mysql.createConnection(process.env.DATABASE_URL);

for (const sql of migrations) {
  const name = sql.match(/CREATE TABLE IF NOT EXISTS `(\w+)`/)?.[1] ?? "unknown";
  try {
    await conn.execute(sql);
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
    process.exit(1);
  }
}

await conn.end();
console.log("Stripe migration complete.");
