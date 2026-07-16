import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { RaceEvent } from "../types";

export async function initRaceNotifications(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  const { display } = await LocalNotifications.requestPermissions();
  return display === "granted";
}

export async function notifySafetyCar(event: RaceEvent): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.schedule({
    notifications: [
      {
        // Notification ids must fit in a Java int
        id: Date.now() % 2_147_483_647,
        title: `Safety car — lap ${event.lap}`,
        body: event.message
      }
    ]
  });
}
