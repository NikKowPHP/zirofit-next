Build Error

Module not found: Can't resolve 'net'

./node_modules/agent-base/dist/index.js (30:1)

Module not found: Can't resolve 'net'
  28 | Object.defineProperty(exports, "__esModule", { value: true });
  29 | exports.Agent = void 0;
> 30 | const net = __importStar(require("net"));
     | ^
  31 | const http = __importStar(require("http"));
  32 | const https_1 = require("https");
  33 | __exportStar(require("./helpers"), exports);

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./node_modules/https-proxy-agent/dist/index.js
./src/lib/supabase/client.ts
./src/components/notifications/NotificationIndicator.tsx
./src/components/layouts/TrainerDashboardLayout.tsx