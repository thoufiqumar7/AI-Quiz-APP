const bcrypt = require('bcryptjs');
const User = require('../models/User');

const DEMO_EMAIL = 'demo@smartquiz.ai';
const DEMO_PASSWORD = 'DemoMode123!';

async function ensureDemoUser() {
  try {
    const existing = await User.findOne({ email: DEMO_EMAIL });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12);
      await User.create({
        name: 'Demo User',
        email: DEMO_EMAIL,
        password: hashedPassword,
        role: 'user', // explicitly keep as normal user to prevent admin access
      });
      console.log('✅ Demo user seeded automatically.');
    } else {
      // Ensure password hasn't been maliciously changed
      const isValid = await bcrypt.compare(DEMO_PASSWORD, existing.password);
      if (!isValid) {
        existing.password = await bcrypt.hash(DEMO_PASSWORD, 12);
        await existing.save();
        console.log('🔄 Demo user password reset to default.');
      }
    }
  } catch (error) {
    console.error('❌ Failed to ensure demo user:', error.message);
  }
}

module.exports = {
  ensureDemoUser,
  DEMO_EMAIL
};
