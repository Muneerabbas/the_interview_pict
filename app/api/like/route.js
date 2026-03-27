import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { revalidatePath } from "next/cache";

const client = new MongoClient(process.env.MONGODB_URI);

export async function POST(req) {
    try {
        const { id, email } = await req.json();

        if (!id || !email) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await client.connect();
        const db = client.db("int-exp");
        const experience = db.collection("experience");


        const now = new Date();

        await experience.updateOne(
            { uid: id },
            [
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
            ]
        );

        revalidatePath("/feed");
        revalidatePath("/topStories");
        revalidatePath(`/single/${id}`);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error toggling like:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
