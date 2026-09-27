import { NextResponse } from 'next/server';
import { googleSheets } from '@/lib/sheets/googleSheetsClient';
import {
  categoryRepo,
  customerRepo,
  inventoryRepo,
  orderRepo,
  productRepo,
} from '@/lib/repositories/sheetRepositories';

export async function POST() {
  try {
    const isConfigured = googleSheets.isConfigured();

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        status: 'Unconfigured',
        message:
          'Google Sheet credentials (GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY) are not configured in environment variables. System is running on the high-speed local persistent repository.',
      });
    }

    // Try reading a test range to verify connection
    const testRows = await googleSheets.getRows('PRODUCTS!A1:B5');

    return NextResponse.json({
      success: true,
      status: 'Connected',
      message: 'Successfully connected and verified Google Sheets API v4 integration!',
      details: {
        rowsRead: testRows ? testRows.length : 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'Error',
        message: error.message || 'Failed to communicate with Google Sheets API',
      },
      { status: 500 }
    );
  }
}
