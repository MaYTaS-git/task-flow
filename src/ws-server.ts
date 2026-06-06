// Standalone WebSockets server running on port 3001 (using Bun.serve)

declare const Bun: {
	serve: (options: {
		port: number;
		fetch: (req: Request, server: { upgrade: (req: Request) => boolean }) => Response | Promise<Response> | undefined;
		websocket: {
			message: (ws: unknown, message: { toString(): string }) => void;
			close: (ws: unknown) => void;
		};
	}) => unknown;
};

interface ClientSocket {
	send(message: string): void;
	userId?: number;
}

const clients = new Map<number, ClientSocket>(); // userId -> websocket connection

const server = Bun.serve({
	port: 3001,
	fetch(req, server) {
		const url = new URL(req.url);

		// HTTP notification relay endpoint
		if (req.method === "POST" && url.pathname === "/notify") {
			return req.json()
				.then((body) => {
					const { userId, title, message, type } = body as {
						userId: number;
						title: string;
						message: string;
						type: string;
					};
					const client = clients.get(userId);
					if (client) {
						client.send(JSON.stringify({ title, message, type, createdAt: new Date() }));
					}
					return Response.json({ success: true });
				})
				.catch(() => {
					return new Response("Invalid JSON body", { status: 400 });
				});
		}

		// WebSocket upgrade endpoint
		if (url.pathname === "/ws") {
			const success = server.upgrade(req);
			if (success) {
				return undefined;
			}
			return new Response("WebSocket upgrade failed", { status: 400 });
		}

		return new Response("Not Found", { status: 404 });
	},
	websocket: {
		message(ws, message) {
			try {
				const data = JSON.parse(message.toString()) as {
					type?: string;
					userId?: string;
				};
				if (data.type === "auth" && data.userId) {
					const userId = parseInt(data.userId);
					if (!isNaN(userId)) {
						const customWs = ws as unknown as ClientSocket;
						customWs.userId = userId;
						clients.set(userId, customWs);
					}
				}
			} catch {
				// invalid payload
			}
		},
		close(ws) {
			const customWs = ws as unknown as ClientSocket;
			const userId = customWs.userId;
			if (userId) {
				clients.delete(userId);
			}
		},
	},
});

console.log(`WebSocket and Notification relay running on ws://localhost:3001/ws and http://localhost:3001/notify`);
export default server;
