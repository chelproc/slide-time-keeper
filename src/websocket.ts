let webSocketConnectionPromise: Promise<WebSocket> | null;
function getWebSocketConnection() {
  if (webSocketConnectionPromise) return webSocketConnectionPromise;
  webSocketConnectionPromise = new Promise((resolve) => {
    let isAlive = true;
    const newConnection = new WebSocket(
      `${location.origin.replace(/^http/, "ws")}/ws`
    );
    newConnection.addEventListener("open", () => {
      console.info("Connection established.");
      resolve(newConnection);
    });
    newConnection.addEventListener("message", async (e) => {
      const message = await e.data.text();
      for (const handler of onMessageHandlers) {
        handler(message);
      }
    });
    newConnection.addEventListener("close", () => {
      if (!isAlive) return;
      console.warn("Connection closed. Retrying...");
      isAlive = false;
      webSocketConnectionPromise = null;
      getWebSocketConnection();
    });
    newConnection.addEventListener("error", () => {
      if (!isAlive) return;
      isAlive = false;
      console.error("Connection failed. Retrying...");
      setTimeout(() => {
        webSocketConnectionPromise = null;
        resolve(getWebSocketConnection());
      }, 3000);
    });
    setTimeout(() => {
      if (!isAlive) return;
      if (newConnection.readyState !== newConnection.OPEN) {
        isAlive = false;
        console.error("Connection timeout. Retrying...");
        setTimeout(() => {
          webSocketConnectionPromise = null;
          resolve(getWebSocketConnection());
        }, 3000);
      }
    }, 3000);
  });
  return webSocketConnectionPromise;
}
getWebSocketConnection();

export const onMessageHandlers = new Set<(message: string) => void>();
export async function sendMessage(message: string) {
  const connection = await getWebSocketConnection();
  connection.send(message);
}
