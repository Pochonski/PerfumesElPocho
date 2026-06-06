import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Clock } from "@phosphor-icons/react/dist/ssr";
import { getAllGuias, getGuiaBySlug } from "@/data/guias";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Footer from "@/components/sections/Footer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllGuias().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guia = getGuiaBySlug(slug);
  if (!guia) return { title: "Guía no encontrada" };

  return {
    title: `${guia.title} | Perfumes El Pocho`,
    description: guia.description,
    openGraph: {
      title: guia.title,
      description: guia.description,
      type: "article",
      publishedTime: guia.publishedAt,
    },
  };
}

export default async function GuiaPage({ params }: PageProps) {
  const { slug } = await params;
  const guia = getGuiaBySlug(slug);
  if (!guia) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guia.title,
            description: guia.description,
            datePublished: guia.publishedAt,
            author: {
              "@type": "Organization",
              name: "Perfumes El Pocho",
            },
            publisher: {
              "@type": "Organization",
              name: "Perfumes El Pocho",
              url: "https://perfumeselpocho.com",
            },
          }),
        }}
      />

      <main className="min-h-screen pt-28 pb-20">
        <article className="mx-auto max-w-3xl px-6 md:px-8">
          <AnimatedSection>
            <Link
              href="/guias"
              className="inline-flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
            >
              <ArrowLeft size={14} weight="bold" /> Volver a guías
            </Link>

            <span className="mt-8 block text-[10px] font-semibold uppercase tracking-[0.15em] text-[color:var(--accent)]">
              {guia.category}
            </span>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tighter text-[color:var(--foreground)] md:text-5xl">
              {guia.title}
            </h1>

            <div className="mt-4 flex items-center gap-4 text-xs text-[color:var(--muted)]">
              <time dateTime={guia.publishedAt}>
                {new Date(guia.publishedAt).toLocaleDateString("es-CR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className="flex items-center gap-1">
                <Clock size={12} weight="bold" />
                {guia.readMinutes} min
              </span>
            </div>

            <p className="mt-6 text-lg leading-relaxed text-[color:var(--muted-foreground)]">
              {guia.description}
            </p>

            <div className="prose-invert mt-10 max-w-none text-[color:var(--foreground)]/90">
              {guia.content.split("\n\n").map((paragraph, i) => {
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2
                      key={i}
                      className="mt-12 mb-4 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]"
                    >
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("|")) {
                  // Simple markdown table
                  const rows = paragraph.split("\n").filter((r) => r.trim());
                  const [header, _divider, ...body] = rows;
                  return (
                    <div key={i} className="card-surface my-8 overflow-x-auto rounded-2xl p-0">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[color:var(--border-subtle)]">
                            {header
                              .split("|")
                              .filter((c) => c.trim())
                              .map((c, j) => (
                                <th
                                  key={j}
                                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)]"
                                >
                                  {c.trim()}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {body.map((row, j) => (
                            <tr
                              key={j}
                              className="border-b border-[color:var(--border-subtle)] last:border-0"
                            >
                              {row
                                .split("|")
                                .filter((c) => c.trim())
                                .map((c, k) => (
                                  <td
                                    key={k}
                                    className="px-4 py-3 text-[color:var(--foreground)]/80"
                                  >
                                    {c.trim()}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                if (paragraph.startsWith("- ") || paragraph.startsWith("1. ")) {
                  const items = paragraph.split("\n");
                  const isOrdered = paragraph.startsWith("1. ");
                  const Tag = isOrdered ? "ol" : "ul";
                  return (
                    <Tag
                      key={i}
                      className={`my-6 space-y-2 pl-6 ${
                        isOrdered ? "list-decimal" : "list-disc"
                      } marker:text-[color:var(--accent)]`}
                    >
                      {items.map((item, j) => (
                        <li
                          key={j}
                          className="text-[color:var(--foreground)]/85"
                        >
                          {item.replace(/^[\d\-]+\.\s*|^-\s*/, "")}
                        </li>
                      ))}
                    </Tag>
                  );
                }
                return (
                  <p
                    key={i}
                    className="my-6 leading-relaxed text-[color:var(--foreground)]/85"
                  >
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </AnimatedSection>
        </article>
      </main>

      <Footer />
    </>
  );
}
