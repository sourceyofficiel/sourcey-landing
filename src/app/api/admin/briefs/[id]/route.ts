import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALLOWED_STATUSES = [
  "new",
  "in-review",
  "supplier-contacted",
  "quote-ready",
  "ordered",
  "completed",
  "cancelled",
];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      status?: string;
      internalNotes?: string;
    };

    const data: Record<string, unknown> = {};
    if (body.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      data.status = body.status;
    }
    if (body.internalNotes !== undefined) {
      data.internalNotes = body.internalNotes || null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.brief.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ ok: true, brief: updated });
  } catch (e) {
    console.error("[/api/admin/briefs/:id]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
