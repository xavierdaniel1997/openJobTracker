const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        if (line.trim().startsWith('#') || !line.includes('=')) return;
        const [key, ...values] = line.split('=');
        const value = values.join('=').trim().replace(/^"|"$/g, '');
        process.env[key.trim()] = value;
    });
    console.log('Loaded .env manually.');
} else {
    console.log('.env not found at', envPath);
}

console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 'undefined');

try {
    execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
} catch (e) {
    console.error('Migration failed');
    process.exit(1);
}
