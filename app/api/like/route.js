import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getMongoDb } from "@/lib/mongodb";
import { jsonError } from "@/lib/api-response";

export async function POST(req) {
    try {
        const { id, email } = await req.json();

        if (!id || !email) {
            return NextResponse.json({ success: false, error: "Missing required fields", code: "VALIDATION_ERROR" }, { status: 400 });
        }

        const db = await getMongoDb({ mode: "write" });
        const experience = db.collection("experience");
        const tales = db.collection("tales");

        const now = new Date();

        const updatePipeline = [
            {
                $set: {
                    likes: {
                        $cond: [
                            { $in: [email, { $ifNull: ["$likes", []] }] },
                            { $setDifference: ["$likes", [email]] },
                            { $concatArrays: [{ $ifNull: ["$likes", []] }, [email]] }
                        ]
                    },
                    likesUpdatedAt: now,
                }
            }
        ];

        let result = await experience.updateOne({ uid: id }, updatePipeline);

        if (result.matchedCount === 0) {
            result = await tales.updateOne({ uid: id }, updatePipeline);
        }

        revalidatePath("/feed");
        revalidatePath("/topStories");
        revalidatePath(`/single/${id}`);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error toggling like:", error);
        return jsonError(error, "Unable to update like");
    }
}
