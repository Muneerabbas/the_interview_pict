export async function GET(req) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const draft = await drafts.findOne({ email });

    if (!draft) {
      return NextResponse.json({ message: "No draft found" }, { status: 404 });
    }

    return NextResponse.json(draft, { status: 200 });

  } catch (error) {
    console.error("Error retrieving draft:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
