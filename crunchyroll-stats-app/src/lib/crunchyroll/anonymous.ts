import axios from 'axios';

const AUTH_URL = 'https://www.crunchyroll.com/auth/v1/token';
const CLIENT_ID = 'cr_web';

export async function getAnonymousToken(): Promise<string> {
  try {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_id');

    const response = await axios.post(
      AUTH_URL,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:`).toString('base64')}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get anonymous token:', error);
    throw error;
  }
}