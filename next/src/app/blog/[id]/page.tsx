import { Metadata } from "next";
import BlogDetailContent from "./BlogDetailContent";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://django_app:8000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://baseball-now.com";

interface BlogData {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
}

async function fetchBlog(id: string): Promise<BlogData | null> {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/blogs/${id}/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const blog = await fetchBlog(id);

  if (!blog) {
    return {
      title: "ブログが見つかりません | MLB Note",
    };
  }

  const description = blog.content.slice(0, 120) + (blog.content.length > 120 ? "..." : "");
  const pageUrl = `${SITE_URL}/blog/${blog.id}`;

  return {
    title: `${blog.title} | MLB Note`,
    description,
    openGraph: {
      title: blog.title,
      description,
      url: pageUrl,
      siteName: "MLB Note",
      type: "article",
      ...(blog.image_url && {
        images: [{ url: blog.image_url, width: 1200, height: 630, alt: blog.title }],
      }),
    },
    twitter: {
      card: blog.image_url ? "summary_large_image" : "summary",
      title: blog.title,
      description,
      ...(blog.image_url && { images: [blog.image_url] }),
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogDetailContent id={id} />;
}
