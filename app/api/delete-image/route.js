import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request) {
    try {
        const { public_id } = await request.json();

        if (!public_id) {
            return NextResponse.json({ error: 'No public_id provided' }, { status: 400 });
        }

        const result = await cloudinary.uploader.destroy(public_id);

        if (result.result !== 'ok' && result.result !== 'not found') {
            return NextResponse.json({ error: 'Delete failed', detail: result.result }, { status: 500 });
        }

        return NextResponse.json({ success: true, result: result.result });

    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
