import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-mock";
import { ProfileEditor } from "@/components/profile/ProfileEditor";

export const metadata = {
  title: "Mon profil · Sourcey",
};

export default async function ProfilePage() {
  const userId = await getCurrentUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      companyName: true,
      phone: true,
      ecomPlatform: true,
      monthlyVolume: true,
      bio: true,
      plan: true,
      createdAt: true,
    },
  });
  if (!user) return null;

  const [convCount, productReqCount, serviceOrderCount] = await Promise.all([
    prisma.conversation.count({ where: { userId } }),
    prisma.productRequest.count({ where: { userId } }),
    prisma.serviceOrder.count({ where: { userId } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 md:py-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-[clamp(24px,3vw,32px)] font-extrabold tracking-tight text-neutral-900">
            Mon profil
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Gère ton compte, tes préférences et tes infos entreprise.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <Stat label="Conversations" value={convCount} />
          <Stat label="Devis & samples" value={productReqCount} />
          <Stat label="Services" value={serviceOrderCount} />
          <Stat
            label="Membre depuis"
            value={user.createdAt.toLocaleDateString("fr-FR", {
              month: "short",
              year: "numeric",
            })}
          />
        </div>
      </div>

      <div className="mt-8">
        <ProfileEditor
          user={{
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            companyName: user.companyName,
            phone: user.phone,
            ecomPlatform: user.ecomPlatform,
            monthlyVolume: user.monthlyVolume,
            bio: user.bio,
            plan: user.plan,
          }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-center">
      <p className="font-display text-sm font-extrabold text-neutral-900">{value}</p>
      <p className="text-[10px] font-medium text-neutral-500">{label}</p>
    </div>
  );
}
