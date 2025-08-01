import cron from "node-cron";

import { purgeDeletedMessages } from "@/jobs/purge-deleted-messages";
import { purgeExpiredStories } from "@/jobs/purge-deleted-stories";

// Production
// cron.schedule('0 */12 * * *', purgeDeletedMessages);
// cron.schedule('0 1 * * *', purgeExpiredStories);

// Dev Mode
cron.schedule("*/5 * * * *", purgeDeletedMessages);
cron.schedule("*/5 * * * *", purgeExpiredStories);
