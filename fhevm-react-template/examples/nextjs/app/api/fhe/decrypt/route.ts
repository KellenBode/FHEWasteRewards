import { NextRequest, NextResponse } from 'next/server';

/**
 * Decryption API Route
 * Handles FHE decryption operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { encryptedData, userAddress } = body;

    if (!encryptedData) {
      return NextResponse.json(
        { error: 'Encrypted data is required' },
        { status: 400 }
      );
    }

    // In production, integrate with tfhe-js for real FHE decryption
    // This is a demo implementation
    try {
      const decoded = JSON.parse(
        Buffer.from(encryptedData.ciphertext, 'base64').toString()
      );

      return NextResponse.json({
        success: true,
        decrypted: decoded.value,
        type: decoded.type,
        message: 'Value decrypted successfully',
      });
    } catch (decodeError) {
      return NextResponse.json(
        { error: 'Invalid encrypted data format' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return NextResponse.json(
      { error: 'Decryption failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/fhe/decrypt',
    method: 'POST',
    description: 'Decrypt FHE encrypted values',
    parameters: {
      encryptedData: 'object - Encrypted data object',
      userAddress: 'string - User wallet address (optional for EIP-712)',
    },
  });
}
