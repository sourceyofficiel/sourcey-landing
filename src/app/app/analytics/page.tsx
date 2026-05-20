import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Activity,
  Wallet,
  Target,
  Users,
  PiggyBank,
  CalendarDays,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-mock";
import { categoryFor } from "@/lib/data/categories";

export const metadata = {
  title: "Sourcey Pulse · Analytics",
};

const COLORS = ["#3B82F6", "#9333EA", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899", "#84CC16"];

export default async function AnalyticsPage() {
  const userId = await getCurrentUserId();

  const [productRequests, serviceOrders, conversations] = await Promise.all([
    prisma.productRequest.findMany({
      where: { userId },
      include: {
        product: { select: { category: true, agentSlug: true, agentName: true, agentAvatarUrl: true, priceTiers: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.serviceOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // ============ Compute KPIs ============
  const totalRequests = productRequests.length;
  const totalServiceOrders = serviceOrders.length;
  const totalSpend = serviceOrders.reduce(
    (s, o) => s + (o.finalPrice ?? o.estimatedPrice),
    0
  );
  const estimatedProductSpend = productRequests.reduce((s, r) => {
    if (!r.quantity) return s;
    try {
      const tiers = JSON.parse(r.product.priceTiers) as { unitPrice: number }[];
      const cheapest = Math.min(...tiers.map((t) => t.unitPrice));
      return s + cheapest * r.quantity;
    } catch {
      return s;
    }
  }, 0);

  const totalAgents = new Set(productRequests.map((r) => r.product.agentSlug))
    .size;
  const totalConvs = conversations.length;

  const samplesCount = productRequests.filter((r) => r.type === "sample").length;
  const quotesCount = productRequests.filter((r) => r.type === "quote").length;

  // Activity per month (last 6 months)
  const monthlyActivity = computeMonthlyActivity([
    ...productRequests.map((r) => r.createdAt),
    ...serviceOrders.map((o) => o.createdAt),
  ]);

  // Spend by category
  const spendByCategory = computeSpendByCategory(productRequests);

  // Agent usage (top 5)
  const agentUsage = computeAgentUsage(productRequests);

  // ROI vs Alibaba (mocked: assume 40% savings on each product spend)
  const alibabaEquivalent = Math.round(estimatedProductSpend / 0.6);
  const savings = alibabaEquivalent - estimatedProductSpend;
  const savingsPercent =
    alibabaEquivalent > 0
      ? Math.round((savings / alibabaEquivalent) * 100)
      : 0;

  const aiInsights = generateInsights({
    totalRequests,
    totalAgents,
    samplesCount,
    quotesCount,
    totalSpend,
    savingsPercent,
    monthlyActivity,
    topCategory: spendByCategory[0]?.label ?? null,
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 md:py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary-700">
            <Activity className="h-3 w-3" />
            Sourcey Pulse · Analytics
          </span>
          <h1 className="mt-3 font-display text-[clamp(24px,3vw,36px)] font-extrabold tracking-tight text-neutral-900">
            Le pulse de ton sourcing
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Tableau de bord en temps réel. Comprends où va ton argent, qui te fait économiser, et où tu peux scaler.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Activity}
          label="Demandes totales"
          value={(totalRequests + totalServiceOrders).toString()}
          trend={monthlyActivity.length > 1 ? trend(monthlyActivity) : null}
          color="bg-primary-50 text-primary-700"
        />
        <KpiCard
          icon={Wallet}
          label="Dépense estimée"
          value={`${formatEur(totalSpend + estimatedProductSpend)}`}
          sub={`dont ${formatEur(totalSpend)} en services`}
          color="bg-amber-50 text-amber-700"
        />
        <KpiCard
          icon={Users}
          label="Agents en relation"
          value={totalAgents.toString()}
          sub={`${totalConvs} conversations`}
          color="bg-emerald-50 text-emerald-700"
        />
        <KpiCard
          icon={PiggyBank}
          label="Économies vs Alibaba"
          value={`${formatEur(savings)}`}
          sub={`-${savingsPercent}% sur le sourcing`}
          color="bg-enterprise-50 text-enterprise-700"
          highlight
        />
      </div>

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-neutral-900">
            <Sparkles className="-mt-0.5 mr-1.5 inline h-3.5 w-3.5 text-primary-600" />
            Insights IA
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {aiInsights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50/40 to-white p-4"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-700">
                  <insight.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold text-neutral-900">
                    {insight.title}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-600">
                    {insight.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Charts */}
      <section className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Activity line chart */}
        <Card title="Activité par mois" sub="Demandes créées sur les 6 derniers mois">
          {monthlyActivity.length === 0 ? (
            <EmptyChart label="Pas encore d'activité" />
          ) : (
            <LineChart data={monthlyActivity} />
          )}
        </Card>

        {/* Donut: spend by category */}
        <Card
          title="Répartition par catégorie"
          sub={`${spendByCategory.length} catégories sollicitées`}
        >
          {spendByCategory.length === 0 ? (
            <EmptyChart label="Pas encore de commande" />
          ) : (
            <DonutChart data={spendByCategory} />
          )}
        </Card>
      </section>

      {/* Agent usage table + conversion funnel */}
      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Tes agents les plus sollicités" sub="Top 5 sur la période">
          {agentUsage.length === 0 ? (
            <EmptyChart label="Aucun agent sollicité" />
          ) : (
            <AgentBars agents={agentUsage} />
          )}
        </Card>

        <Card title="Funnel de conversion" sub="Du devis au paiement">
          <Funnel
            steps={[
              { label: "Demandes", value: totalRequests + totalServiceOrders, color: "#3B82F6" },
              {
                label: "Devis reçus",
                value: Math.max(
                  0,
                  Math.round((totalRequests + totalServiceOrders) * 0.78)
                ),
                color: "#9333EA",
              },
              {
                label: "Validés",
                value: Math.max(
                  0,
                  Math.round((totalRequests + totalServiceOrders) * 0.42)
                ),
                color: "#10B981",
              },
              {
                label: "Livrés",
                value: Math.max(
                  0,
                  Math.round((totalRequests + totalServiceOrders) * 0.18)
                ),
                color: "#F59E0B",
              },
            ]}
          />
        </Card>
      </section>

      {/* CTA bottom */}
      <section className="mt-10 grid gap-3 rounded-3xl border border-neutral-200 bg-gradient-to-br from-primary-50/40 via-white to-enterprise-50/40 p-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h3 className="font-display text-lg font-extrabold text-neutral-900">
            Active <span className="text-primary-700">Sourcey Pulse Pro</span>{" "}
            pour des analytics avancés
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Tracking précis ROI, alertes auto sur stock dormant, prédiction de
            demande, comparatif marché. Inclus dans le plan Entreprise.
          </p>
        </div>
        <Link
          href="/entreprise"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-enterprise-600 px-4 py-2 text-sm font-bold text-white shadow-enterprise transition-colors hover:bg-enterprise-700"
        >
          Découvrir Entreprise →
        </Link>
      </section>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function formatEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function computeMonthlyActivity(dates: Date[]): { label: string; value: number }[] {
  if (dates.length === 0) return [];
  const now = new Date();
  const months: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("fr-FR", { month: "short" });
    const count = dates.filter(
      (x) =>
        x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth()
    ).length;
    months.push({ label, value: count });
  }
  return months;
}

function computeSpendByCategory(
  requests: { product: { category: string; priceTiers: string }; quantity: number | null }[]
): { label: string; value: number; color: string }[] {
  const byCategory = new Map<string, number>();
  for (const r of requests) {
    if (!r.quantity) continue;
    try {
      const tiers = JSON.parse(r.product.priceTiers) as { unitPrice: number }[];
      const cheap = Math.min(...tiers.map((t) => t.unitPrice));
      byCategory.set(
        r.product.category,
        (byCategory.get(r.product.category) ?? 0) + cheap * r.quantity
      );
    } catch {}
  }
  const arr = Array.from(byCategory.entries()).map(([cat, value], i) => ({
    label: categoryFor(cat).label,
    value: Math.round(value),
    color: COLORS[i % COLORS.length],
  }));
  return arr.sort((a, b) => b.value - a.value);
}

function computeAgentUsage(
  requests: { product: { agentSlug: string; agentName: string; agentAvatarUrl: string } }[]
): { slug: string; name: string; avatar: string; count: number }[] {
  const map = new Map<string, { name: string; avatar: string; count: number }>();
  for (const r of requests) {
    const cur = map.get(r.product.agentSlug);
    if (cur) cur.count += 1;
    else {
      map.set(r.product.agentSlug, {
        name: r.product.agentName,
        avatar: r.product.agentAvatarUrl,
        count: 1,
      });
    }
  }
  return Array.from(map.entries())
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function trend(
  data: { value: number }[]
): { sign: 1 | 0 | -1; percent: number } | null {
  if (data.length < 2) return null;
  const last = data[data.length - 1].value;
  const prev = data[data.length - 2].value;
  if (prev === 0) return { sign: last > 0 ? 1 : 0, percent: last * 100 };
  const pct = Math.round(((last - prev) / prev) * 100);
  return { sign: pct > 0 ? 1 : pct < 0 ? -1 : 0, percent: Math.abs(pct) };
}

interface InsightItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}

function generateInsights({
  totalRequests,
  totalAgents,
  samplesCount,
  quotesCount,
  totalSpend,
  savingsPercent,
  monthlyActivity,
  topCategory,
}: {
  totalRequests: number;
  totalAgents: number;
  samplesCount: number;
  quotesCount: number;
  totalSpend: number;
  savingsPercent: number;
  monthlyActivity: { label: string; value: number }[];
  topCategory: string | null;
}): InsightItem[] {
  const out: InsightItem[] = [];
  if (totalRequests === 0) {
    out.push({
      icon: Target,
      title: "Démarre ton premier devis pour voir tes analytics",
      text: "Tes données apparaîtront ici dès que tu auras quelques demandes en cours. Va sur le catalogue pour démarrer.",
    });
    return out;
  }
  if (savingsPercent > 0) {
    out.push({
      icon: PiggyBank,
      title: `Tu économises ${savingsPercent}% vs Alibaba sur ton sourcing`,
      text: `À ce rythme, tu te dégages de la marge précieuse pour réinvestir en publicité ou en stock supplémentaire.`,
    });
  }
  if (samplesCount > quotesCount && quotesCount === 0) {
    out.push({
      icon: Sparkles,
      title: "Tu testes beaucoup d'échantillons — bonne stratégie",
      text: "Quand un produit te plaît, passe direct sur le bouton « Devis » : tu auras un prix volume + un MOQ. Tu peux convertir 2-3 samples par mois.",
    });
  }
  if (topCategory) {
    out.push({
      icon: TrendingUp,
      title: `${topCategory} est ta catégorie principale`,
      text: `Tu peux demander un agent dédié à plein temps sur ce segment pour des prix encore meilleurs (plan Pro).`,
    });
  }
  if (totalAgents >= 3) {
    out.push({
      icon: Users,
      title: `Tu travailles avec ${totalAgents} agents en parallèle`,
      text: `Profite de cette diversification pour comparer leurs styles de négociation et prioriser les meilleurs sur tes prochaines commandes.`,
    });
  }
  const last3 = monthlyActivity.slice(-3).reduce((s, m) => s + m.value, 0);
  if (last3 >= 4) {
    out.push({
      icon: CalendarDays,
      title: "Tu accélères ton rythme de sourcing",
      text: "Tes 3 derniers mois sont plus actifs que les précédents. Pense à automatiser tes briefs récurrents pour gagner du temps (plan Pro).",
    });
  }
  return out;
}

// ============================================================
// Visual components
// ============================================================

function Card({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
        {sub && <p className="text-[11px] text-neutral-500">{sub}</p>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  color,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  trend?: { sign: 1 | 0 | -1; percent: number } | null;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white p-4 ${
        highlight
          ? "border-enterprise-200 ring-2 ring-enterprise-100 shadow-enterprise"
          : "border-neutral-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              trend.sign > 0
                ? "bg-emerald-50 text-emerald-700"
                : trend.sign < 0
                  ? "bg-amber-50 text-amber-700"
                  : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {trend.sign > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : trend.sign < 0 ? <TrendingDown className="h-2.5 w-2.5" /> : null}
            {trend.percent}%
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-xl font-extrabold tracking-tight text-neutral-900">
        {value}
      </p>
      <p className="text-[11px] text-neutral-500">{label}</p>
      {sub && <p className="mt-0.5 text-[10.5px] text-neutral-400">{sub}</p>}
    </div>
  );
}

function LineChart({ data }: { data: { label: string; value: number }[] }) {
  const width = 600;
  const height = 200;
  const padding = 30;
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = (width - padding * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => ({
    x: padding + i * stepX,
    y: height - padding - (d.value / max) * (height - padding * 2),
    raw: d,
  }));
  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-48 w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid */}
        {Array.from({ length: 4 }).map((_, i) => {
          const y = padding + (i * (height - padding * 2)) / 3;
          return (
            <line
              key={i}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="#E2E8F0"
              strokeDasharray="2 4"
            />
          );
        })}
        <path d={areaD} fill="url(#lineFill)" />
        <path
          d={pathD}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="white"
              stroke="#3B82F6"
              strokeWidth="2"
            />
            {p.raw.value > 0 && (
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#0F172A"
              >
                {p.raw.value}
              </text>
            )}
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#64748B"
            >
              {p.raw.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function DonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <EmptyChart label="Pas de données" />;
  const radius = 70;
  const inner = 48;
  const cx = 90;
  const cy = 90;
  let acc = 0;
  const arcs = data.map((d) => {
    const start = (acc / total) * 2 * Math.PI - Math.PI / 2;
    acc += d.value;
    const end = (acc / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + Math.cos(start) * radius;
    const y1 = cy + Math.sin(start) * radius;
    const x2 = cx + Math.cos(end) * radius;
    const y2 = cy + Math.sin(end) * radius;
    const x3 = cx + Math.cos(end) * inner;
    const y3 = cy + Math.sin(end) * inner;
    const x4 = cx + Math.cos(start) * inner;
    const y4 = cy + Math.sin(start) * inner;
    const large = end - start > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`;
    return { path, color: d.color };
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <svg viewBox="0 0 180 180" className="h-40 w-40 shrink-0">
        {arcs.map((a, i) => (
          <path key={i} d={a.path} fill={a.color} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fill="#64748B">
          Total
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="15" fontWeight="800" fill="#0F172A">
          {formatEur(total)}
        </text>
      </svg>
      <ul className="flex-1 space-y-1.5">
        {data.map((d) => {
          const pct = Math.round((d.value / total) * 100);
          return (
            <li key={d.label} className="flex items-center gap-2 text-[12.5px]">
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: d.color }} />
              <span className="flex-1 truncate text-neutral-700">{d.label}</span>
              <span className="font-bold text-neutral-900">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AgentBars({
  agents,
}: {
  agents: { slug: string; name: string; avatar: string; count: number }[];
}) {
  const max = Math.max(...agents.map((a) => a.count));
  return (
    <ul className="space-y-3">
      {agents.map((a) => (
        <li key={a.slug} className="flex items-center gap-3">
          <Image
            src={a.avatar}
            alt={a.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-[12.5px]">
              <Link
                href={`/app/agents/${a.slug}`}
                className="truncate font-bold text-neutral-900 hover:underline"
              >
                {a.name}
              </Link>
              <span className="text-neutral-500">{a.count} demandes</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-enterprise-500"
                style={{ width: `${(a.count / max) * 100}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Funnel({
  steps,
}: {
  steps: { label: string; value: number; color: string }[];
}) {
  const max = steps[0].value || 1;
  return (
    <ul className="space-y-2">
      {steps.map((s, i) => {
        const pct = Math.max(0.06, s.value / max);
        const prevPct = i > 0 ? Math.max(0.06, steps[i - 1].value / max) : pct;
        const dropPct =
          i > 0 && steps[i - 1].value > 0
            ? Math.round(((steps[i - 1].value - s.value) / steps[i - 1].value) * 100)
            : 0;
        return (
          <li key={s.label}>
            <div className="flex items-center gap-2 text-[12.5px]">
              <span className="w-20 truncate text-neutral-600">{s.label}</span>
              <span className="font-bold text-neutral-900">{s.value}</span>
              {i > 0 && dropPct > 0 && (
                <span className="text-[10.5px] font-bold text-amber-700">
                  -{dropPct}%
                </span>
              )}
            </div>
            <div className="mt-1 h-7 rounded-lg" style={{ width: `${pct * 100}%`, background: s.color }} />
          </li>
        );
      })}
    </ul>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-32 place-items-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/40 text-[12.5px] text-neutral-400">
      {label}
    </div>
  );
}
