import { NextResponse } from 'next/server';
import cloudinary, { userFolder } from '@/lib/cloudinary';
import { requireSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request) {
    const auth = await requireSession();
    if (auth.response) return auth.response;

    const limited = await checkRateLimit(request, { key: 'delete-image', limit: 60, windowSeconds: 600 });
    if (limited) return limited;

    try {
        const { public_id } = await request.json().catch(() => ({}));

        if (!public_id || typeof public_id !== 'string') {
            return NextResponse.json({ error: 'No public_id provided' }, { status: 400 });
        }

        // Folder-scoped was not enough: everyone's uploads shared one folder, so
        // anyone could lift the public_ids out of a victim's post HTML and destroy
        // their images. Only the uploader's own subfolder is deletable now.
        // (Images uploaded before this change live in the old flat folder and are
        // no longer deletable through the app -- they are simply left in place.)
        const allowed = `${userFolder(auth.email)}/`;
        if (!public_id.startsWith(allowed) || public_id.includes('..')) {
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
