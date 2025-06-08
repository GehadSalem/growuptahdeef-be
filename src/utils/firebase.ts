import axios from 'axios';

const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY!;

export async function sendPushNotification(token: string, title: string, body: string): Promise<void> {
  await axios.post(
    'https://fcm.googleapis.com/fcm/send',
    {
      to: token,
      notification: {
        title,
        body,
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${FCM_SERVER_KEY}`,
      }
    }
  );
}
