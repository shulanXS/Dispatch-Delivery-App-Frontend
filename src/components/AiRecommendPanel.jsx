import { useState } from 'react';
import { Sparkles, Loader2, Plus, Check, X } from 'lucide-react';
import * as recommendationsApi from '../api/recommendations';
import { useCartStore } from '../store/useCartStore';

const SAMPLE_PROMPTS = [
  '我想做一顿健康早午餐',
  '来点下午茶零食',
  '夜宵需要高蛋白',
  '朋友聚会准备饮料',
];

// Natural-language shopping panel.
//
// Flow:
//   1. User types what they want (Chinese or English both work; backend
//      tries OpenAI when OPENAI_API_KEY is set, otherwise keyword fallback).
//   2. POST /recommendations returns a summary + matched items with a
//      reason per item.
//   3. User picks which ones to add; we route them through the existing
//      useCartStore.addToCart so they share the same cart UI as the
//      regular catalog flow.
export default function AiRecommendPanel() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState('');
  const [items, setItems] = useState([]);
  const [picked, setPicked] = useState({}); // productId -> boolean
  const addToCart = useCartStore((s) => s.addToCart);

  const reset = () => {
    setError(null);
    setSummary('');
    setItems([]);
    setPicked({});
  };

  const submit = async (rawQuery) => {
    const q = (rawQuery ?? query).trim();
    if (!q) return;
    setQuery(q);
    reset();
    setLoading(true);
    try {
      const data = await recommendationsApi.getRecommendations(q);
      const list = Array.isArray(data?.items) ? data.items : [];
      setSummary(data?.summary || '');
      setItems(list);
      // Pre-select items that are in stock and under reasonable quantity.
      const initial = {};
      for (const it of list) {
        if (it?.product?.stock > 0) initial[it.productId] = true;
      }
      setPicked(initial);
    } catch (err) {
      setError(err.normalizedMessage || '推荐服务暂不可用，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const togglePick = (productId) =>
    setPicked((prev) => ({ ...prev, [productId]: !prev[productId] }));

  const confirmAdd = () => {
    let addedCount = 0;
    for (const it of items) {
      if (!picked[it.productId]) continue;
      const qty = Math.max(1, Number(it.quantity) || 1);
      for (let i = 0; i < qty; i += 1) {
        addToCart(it.product);
      }
      addedCount += qty;
    }
    if (addedCount > 0) {
      setOpen(false);
      setQuery('');
      reset();
    }
  };

  const pickedCount = Object.values(picked).filter(Boolean).length;

  return (
    <div className="mx-4 mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 text-white shadow-md shadow-fuchsia-200/60 hover:shadow-lg transition-all"
      >
        <span className="flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4" />
          AI 帮你挑
        </span>
        <span className="text-xs opacity-90">
          {open ? '收起' : '描述需求，一键加车'}
        </span>
      </button>

      {open && (
        <div className="mt-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-start gap-2">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如：周末早午餐想准备点面包、牛油果和咖啡"
              className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              rows={2}
              maxLength={200}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => submit()}
              disabled={loading || !query.trim()}
              className="shrink-0 px-3 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              推荐
            </button>
          </div>

          {!loading && items.length === 0 && !error && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">没想好？试试：</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => submit(p)}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 hover:bg-violet-50 hover:text-violet-700 text-gray-600 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 flex items-start gap-2">
              <X className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
              正在为你挑选合适的商品…
            </div>
          )}

          {!loading && items.length > 0 && (
            <>
              {summary && (
                <div className="mt-3 text-sm text-violet-700 bg-violet-50 rounded-lg px-3 py-2">
                  {summary}
                </div>
              )}
              <ul className="mt-3 space-y-2">
                {items.map((it) => {
                  const p = it.product;
                  if (!p) return null;
                  const outOfStock = !p.stock || p.stock <= 0;
                  const checked = !!picked[it.productId];
                  return (
                    <li
                      key={it.productId}
                      className={`flex items-center gap-3 p-2 rounded-xl border transition-colors ${
                        checked
                          ? 'border-violet-300 bg-violet-50/60'
                          : 'border-gray-100'
                      } ${outOfStock ? 'opacity-60' : ''}`}
                    >
                      <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePick(it.productId)}
                          disabled={outOfStock}
                          className="w-4 h-4 accent-violet-600"
                        />
                        <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">📦</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {it.reason || '推荐'} ·{' '}
                            {outOfStock ? '无库存' : `库存 ${p.stock}`}
                          </p>
                        </div>
                      </label>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-800">
                          ¥{Number(p.price).toFixed(2)}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          ×{it.quantity || 1}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={confirmAdd}
                disabled={pickedCount === 0}
                className="mt-3 w-full py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                加入购物车
                {pickedCount > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/20">
                    {pickedCount} 项
                  </span>
                )}
              </button>

              {pickedCount === 0 && (
                <p className="text-[11px] text-gray-400 mt-1.5 text-center">
                  勾选至少 1 项再加入
                </p>
              )}
            </>
          )}

          {!loading && items.length === 0 && !error && summary === '' && (
            <div className="mt-3 text-[11px] text-gray-400 text-center">
              <Check className="w-3 h-3 inline-block mr-1 -mt-0.5" />
              支持中文与英文描述，未配置 AI Key 时使用关键字匹配
            </div>
          )}
        </div>
      )}
    </div>
  );
}