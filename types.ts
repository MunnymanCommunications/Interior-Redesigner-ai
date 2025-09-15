
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 URL for display
}

export interface GeminiImagePart {
  inlineData: {
    mimeType: string;
    data: string; // base64 encoded string
  }
}
