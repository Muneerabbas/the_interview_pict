import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { requireSession } from '@/lib/auth';

// Uploads all land in this folder (see app/api/upload/route.js); refuse to touch
// anything outside it so a crafted public_id cannot reach the rest of the account.
const ALLOWED_FOLDER = 'interview-pict/articles';

export async function POST(request) {
    const auth = await requireSession();
    if (auth.response) return auth.response;

    try {
        const { public_id } = await request.json().catch(() => ({}));

        if (!public_id || typeof public_id !== 'string') {
            return NextResponse.json({ error: 'No public_id provided' }, { status: 400 });
        }

        if (!public_id.startsWith(`${ALLOWED_FOLDER}/`) || public_id.includes('..')) {
            return NextResponse.json({ error: 'Forbidden public_id' }, { status: 403 });
        }

        const result = await cloudinary.uploader.destroy(public_id);

        if (result.result !== 'ok' && result.result !== 'not found') {
            return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true, result: result.result });

    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
