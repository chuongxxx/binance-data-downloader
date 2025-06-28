import { NextResponse } from 'next/server';
export async function GET() {
    const hello = 'Hello guy!';
    return NextResponse.json(hello, { status: 200 });
}
