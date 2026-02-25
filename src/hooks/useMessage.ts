import type { ExtensionMessage, MessageResponse } from '@shared/messages';

export async function sendMessage<T = void>(
  message: ExtensionMessage
): Promise<MessageResponse<T>> {
  return chrome.runtime.sendMessage(message) as Promise<MessageResponse<T>>;
}
