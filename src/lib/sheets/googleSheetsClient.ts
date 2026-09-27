import crypto from 'crypto';

interface GoogleAuthToken {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: GoogleAuthToken | null = null;

/**
 * Generates an OAuth2 access token for Google Service Account using RS256 JWT
 */
async function getGoogleAccessToken(
  clientEmail: string,
  privateKeyRaw: string
): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);

  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.accessToken;
  }

  try {
    // Format private key (replace escaped newlines if any)
    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const claimSet = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    const base64UrlEncode = (str: string) =>
      Buffer.from(str)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
    const signInput = `${encodedHeader}.${encodedClaimSet}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signInput);
    signer.end();
    const signature = signer.sign(privateKey);
    const encodedSignature = signature
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const jwt = `${signInput}.${encodedSignature}`;

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Failed to authenticate Google Service Account:', err);
      return null;
    }

    const data = await response.json();
    cachedToken = {
      accessToken: data.access_token,
      expiresAt: now + (data.expires_in || 3600),
    };

    return cachedToken.accessToken;
  } catch (error) {
    console.error('Error generating Google OAuth access token:', error);
    return null;
  }
}

export class GoogleSheetsClient {
  private sheetId: string;
  private clientEmail: string;
  private privateKey: string;

  constructor() {
    this.sheetId = process.env.GOOGLE_SHEET_ID || '';
    this.clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
    this.privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
  }

  isConfigured(): boolean {
    return Boolean(this.sheetId && this.clientEmail && this.privateKey);
  }

  private async getAuthToken(): Promise<string | null> {
    if (!this.isConfigured()) return null;
    return getGoogleAccessToken(this.clientEmail, this.privateKey);
  }

  /**
   * Fetch rows from a given sheet range (e.g. "PRODUCTS!A2:AD")
   */
  async getRows(range: string): Promise<any[][] | null> {
    const token = await this.getAuthToken();
    if (!token) return null;

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(range)}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error(`Google Sheets getRows error (${res.status}):`, await res.text());
        return null;
      }

      const data = await res.json();
      return data.values || [];
    } catch (err) {
      console.error('Google Sheets getRows network error:', err);
      return null;
    }
  }

  /**
   * Append a row to a sheet (e.g. "ORDERS!A:W")
   */
  async appendRow(sheetName: string, rowValues: any[]): Promise<boolean> {
    const token = await this.getAuthToken();
    if (!token) return false;

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      });

      if (!res.ok) {
        console.error(`Google Sheets appendRow error (${res.status}):`, await res.text());
        return false;
      }

      return true;
    } catch (err) {
      console.error('Google Sheets appendRow network error:', err);
      return false;
    }
  }

  /**
   * Batch update values or append multiple rows
   */
  async batchUpdateValues(range: string, values: any[][]): Promise<boolean> {
    const token = await this.getAuthToken();
    if (!token) return false;

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range,
          majorDimension: 'ROWS',
          values,
        }),
      });

      return res.ok;
    } catch (err) {
      console.error('Google Sheets update error:', err);
      return false;
    }
  }
}

export const googleSheets = new GoogleSheetsClient();
