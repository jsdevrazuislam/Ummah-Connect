import "dotenv/config";

import httpServer from "@/app";
import db from "@/config/db";

const PORT = process.env.PORT || 3000;

db.sync({ alter: true }).then(() => {
  console.log("✅ Database synced");
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
