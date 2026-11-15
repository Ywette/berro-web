"use server";

import { requireUser } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export type AvailabilityState = {
  error?: string;
  success?: string;
};

export async function updateDriverAvailability(
  _state: AvailabilityState,
  _formData: FormData,
): Promise<AvailabilityState> {
  await requireUser();
  const dictionary = await getDictionary();
  return { error: dictionary.drivers.notPersisted };
}
