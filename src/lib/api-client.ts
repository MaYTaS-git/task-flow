import { treaty } from "@elysiajs/eden";
import type { app } from "@/app/api/[[...slug]]/route";
import { publicEnv } from "@/constants/public.env";

export const api = treaty<typeof app>(publicEnv.NEXT_PUBLIC_APP_URL).api;

export default api;
