import { cookies } from "next/headers";

export type FlashToast = {
  type: "success" | "error";
  message: string;
};

const FLASH_TOAST_COOKIE = "rt_flash_toast";

export async function setFlashToast(toast: FlashToast): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(FLASH_TOAST_COOKIE, JSON.stringify(toast), {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60,
  });
}

export async function readFlashToast(): Promise<FlashToast | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(FLASH_TOAST_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FlashToast>;

    if ((parsed.type === "success" || parsed.type === "error") && typeof parsed.message === "string" && parsed.message.length > 0) {
      return {
        type: parsed.type,
        message: parsed.message,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export async function consumeFlashToast(): Promise<FlashToast | null> {
  const cookieStore = await cookies();
  const flashToast = await readFlashToast();

  cookieStore.delete(FLASH_TOAST_COOKIE);

  return flashToast;
}
