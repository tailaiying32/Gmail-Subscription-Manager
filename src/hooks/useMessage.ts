import type { ExtensionMessage, MessageResponse } from '@shared/messages';

export async function sendMessage<T = void>(
  message: ExtensionMessage
): Promise<MessageResponse<T>> {
  try {
    return await (chrome.runtime.sendMessage(message) as Promise<MessageResponse<T>>);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
