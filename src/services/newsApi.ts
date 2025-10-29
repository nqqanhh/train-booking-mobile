import axios from "axios";

export type TrainArticle = {
  id: string;
  title: string;
  link: string;
  source: string;
  summary: string;
  image: string | null;
  published_at: string | null;
};
const BASE = "https://train-booking-backend-93io.onrender.com/rss";

// export async function fetchTrainArticles(params?: {
//   q?: string;
//   page?: number;
//   pageSize?: number;
//   fresh?: 0 | 1;
// }) {
//   const { data } = await axios.get(`${BASE}/train-articles`, { params });
//   return data as {
//     ok: boolean;
//     page: number;
//     pageSize: number;
//     total: number;
//     items: TrainArticle[];
//     cached: boolean;
//   };
// }

export async function fetchAllArticals(params?: { q?: string; fresh?: 0 | 1 }) {
  const { data } = await axios.get(`${BASE}/train-articles`, {
    params: { all: 1, q: params?.q, fresh: params?.fresh },
  });
  return data as  { ok: boolean; total: number; items: TrainArticle[]; cached: boolean };
}
export async function fetchTrainArticleDetail(id: string) {
  const { data } = await axios.get(`${BASE}/train-articles/${id}`);
  return data as {
    ok: boolean;
    id: string;
    title: string;
    link: string;
    source: string;
    image: string | null;
    published_at: string | null;
    summary?: string;
    content_html?: string | null;
  };
}
