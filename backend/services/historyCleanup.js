const cron = require('node-cron');
const History = require('../models/History');

// Scheduled job: Runs every day at 2:00 AM (0 0 2 * * *)
// Replaces Spring Boot's HistoryCleanupService (@Scheduled)
const initHistoryCleanupCron = () => {
  cron.schedule('0 0 2 * * *', async () => {
    try {
      console.log('⏰ [Cron] Running daily expired history cleanup job...');
      const result = await History.deleteMany({ expiresAt: { $lt: new Date() } });
      console.log(`🧹 [Cron] Cleaned up ${result.deletedCount} expired history records.`);
    } catch (error) {
      console.error('❌ [Cron Error] Failed to delete expired history:', error.message);
    }
  });
};

module.exports = initHistoryCleanupCron;
