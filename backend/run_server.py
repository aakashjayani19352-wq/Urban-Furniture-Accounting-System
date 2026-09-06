import sys
import time
import traceback
import uvicorn

import os

if __name__ == '__main__':
    port = int(os.getenv("PORT", 8001))
    while True:
        try:
            print(f"Starting Urban Accounting API on http://0.0.0.0:{port} ...", flush=True)
            uvicorn.run(
                "app.main:app",
                host="0.0.0.0",
                port=port,
                log_level="info"
            )
            print("Uvicorn exited, restarting in 1s...", flush=True)
            time.sleep(1)
        except KeyboardInterrupt:
            print("Server stopped by user.", flush=True)
            break
        except Exception as e:
            print(f"Server exception caught: {e}", file=sys.stderr, flush=True)
            traceback.print_exc()
            time.sleep(1)
