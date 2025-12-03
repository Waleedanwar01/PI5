import React from 'react';
import SmartLink from './SmartLink.jsx';
import SmartImage from './SmartImage.jsx';

function SectionHeader({ title, subtitle, center = false }) {
  if (!title && !subtitle) return null;
  return (
    <header className={`mb-4 md:mb-6 ${center ? 'text-center' : ''}`}>
      {title ? (
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">{title}</h2>
      ) : null}
      {subtitle ? (
        <p className={`mt-1 text-sm md:text-base text-gray-600 leading-relaxed ${center ? 'mx-auto' : ''}`}>{subtitle}</p>
      ) : null}
    </header>
  );
}

function RichHTML({ html, className }) {
  if (!html) return null;
  
  return (
    <div className={`rich-html max-w-none break-words leading-relaxed text-gray-800 ${className || ''}`}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

// Minimal renderer for EditorJS-like blocks (images, videos, embeds, paragraphs, headers, lists)
function BlocksRenderer({ blocks, roundImages = false, imageSizePx }) {
  if (!blocks) return null;
  // Accept either {blocks: [...]} or direct array
  const arr = Array.isArray(blocks) ? blocks : (blocks.blocks || []);
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return (
    <div className="space-y-4">
      {arr.map((b, i) => {
        const type = b.type || b.block_type || '';
        const data = b.data || b.value || {};
        if (type === 'paragraph') {
          return <p key={i} className="text-gray-800 leading-relaxed mb-4">{data.text}</p>;
        }
        if (type === 'header') {
          const level = data.level || 2;
          const Tag = `h${Math.min(Math.max(level, 1), 6)}`;
          const headerClasses = {
            1: 'text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 mt-10',
            2: 'text-3xl md:text-4xl font-bold text-gray-900 mb-5 mt-8',
            3: 'text-2xl md:text-3xl font-semibold text-gray-800 mb-4 mt-6',
            4: 'text-xl md:text-2xl font-semibold text-gray-800 mb-3 mt-5',
            5: 'text-lg md:text-xl medium text-gray-700 mb-2 mt-4',
            6: 'text-base md:text-lg medium text-gray-700 mb-1 mt-3',
          };
          return <Tag key={i} className={headerClasses[level]}>{data.text}</Tag>;
        }
        if (type === 'list') {
          const style = data.style || 'unordered';
          const items = Array.isArray(data.items) ? data.items : [];
          return style === 'ordered' ? (
            <ol key={i} className="list-decimal pl-6 space-y-2 mb-4 text-gray-700">{items.map((it, idx) => <li key={idx}>{it}</li>)}</ol>
          ) : (
            <ul key={i} className="list-disc pl-6 space-y-2 mb-4 text-gray-700">{items.map((it, idx) => <li key={idx}>{it}</li>)}</ul>
          );
        }
        if (type === 'image') {
          const url = data.file?.url || data.url;
          const caption = data.caption || '';
          return (
            <figure key={i} className="max-w-full mx-auto my-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={caption || 'Image'}
                className={`${roundImages ? 'rounded-full object-cover w-[200px] h-[200px] mx-auto' : 'rounded-lg object-contain w-full h-auto'} border border-gray-200 shadow-sm`}
                style={roundImages && imageSizePx ? { width: `${imageSizePx}px`, height: `${imageSizePx}px` } : undefined}
              />
              {caption ? <figcaption className="text-sm text-gray-500 mt-2 text-center">{caption}</figcaption> : null}
            </figure>
          );
        }
        if (type === 'video') {
          const url = data.url || data.file?.url;
          return (
            <div key={i} className="max-w-full mx-auto my-6">
              <video src={url} controls className="w-full rounded-lg border border-gray-200 shadow-sm" />
            </div>
          );
        }
        if (type === 'embed') {
          const url = data.embed || data.source || data.url;
          const h = data.height || 360;
          return (
            <div key={i} className="aspect-video max-w-full mx-auto my-6">
              <iframe src={url} title="Embedded content" className="w-full h-full rounded-lg border border-gray-200 shadow-sm" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          );
        }
        if (type === 'quote') {
          return <blockquote key={i} className="border-l-4 border-gray-400 pl-4 py-2 my-6 italic text-gray-700 bg-gray-50 rounded-r-lg">{data.text}</blockquote>;
        }
        if (type === 'code') {
          return <pre key={i} className="bg-gray-100 rounded-lg p-3 overflow-auto my-6 text-sm"><code>{data.code}</code></pre>;
        }
        // Fallback: show JSON
        return <pre key={i} className="bg-gray-50 rounded-lg p-3 overflow-auto text-xs my-6">{JSON.stringify(b, null, 2)}</pre>;
      })}
    </div>
  );
}

export default function SectionRenderer({ sections, mediaBase, roundImages = false, imageSizePx, centerText = false }) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-lg border border-gray-200 p-4 md:p-6 bg-white">
            <p className="text-gray-600 text-sm md:text-base">Content unavailable for this page. Please add page content in Admin.</p>
          </div>
        </div>
      </div>
    );
  }

  const gridClassByCount = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-5',
  };

  let featuredShown = false;
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="max-w-6xl mx-auto space-y-12 md:space-y-16">
        {sections.map((s, idx) => {
          const id = s.id || s.anchor_id || `section-${idx + 1}`;
          const type = s.type || 'rich_text';
          const layout = (s.layout || '').toLowerCase();
          const headerCenter = centerText || layout === 'center' || layout === 'centered';
          const columns = Number(s.columns || 1);
          const gridCls = gridClassByCount[columns] || gridClassByCount[1];
          const bg = s.background_color ? { backgroundColor: s.background_color } : {};
          const fg = s.text_color ? { color: s.text_color } : {};
          const ctaText = s.cta_text || 'Start Now';
          const containsTable = (html) => typeof html === 'string' && html.includes('<table');

          if (type === 'rich_text') {
            const centered = headerCenter;
            return (
              <section id={id} key={id} style={{ ...bg }} className="py-6 md:py-8">
                <SectionHeader title={s.title} subtitle={s.subtitle} center={headerCenter} />
                <div className={`rounded-lg border border-gray-200 p-4 md:p-6 bg-white shadow-sm ${centered ? 'max-w-3xl mx-auto text-center' : ''}`} style={{ ...fg }}>
                  <RichHTML html={s.body} className={`${centered ? 'mx-auto text-center' : ''} ${roundImages ? 'about-img-200' : ''}`} />
                  {s.editor_blocks ? <BlocksRenderer blocks={s.editor_blocks} roundImages={roundImages} imageSizePx={imageSizePx} /> : null}
                  {containsTable(s.body) ? (
                    <StartButton text={ctaText} />
                  ) : null}
                </div>
              </section>
            );
          }

          if (type === 'embed') {
            const url = s.url;
            if (!url) return null;
            return (
              <section id={id} key={id} style={{ ...bg }} className="py-6 md:py-8">
                <SectionHeader title={s.title} subtitle={s.subtitle} center={headerCenter} />
                <div className="aspect-video max-w-full mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <iframe
                    src={url}
                    title={s.title || 'Embedded video'}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {s.body ? <RichHTML html={s.body} /> : null}
              </section>
            );
          }

          if (type === 'rich_columns') {
            const cols = [
              { title: s.col1_title, subtitle: s.col1_subtitle, body: s.col1_rich, blocks: s.col1_blocks },
              { title: s.col2_title, subtitle: s.col2_subtitle, body: s.col2_rich, blocks: s.col2_blocks },
              { title: s.col3_title, subtitle: s.col3_subtitle, body: s.col3_rich, blocks: s.col3_blocks },
              { title: s.col4_title, subtitle: s.col4_subtitle, body: s.col4_rich, blocks: s.col4_blocks },
              { title: s.col5_title, subtitle: s.col5_subtitle, body: s.col5_rich, blocks: s.col5_blocks },
            ].slice(0, columns);
            return (
              <section id={id} key={id} style={{ ...bg }} className="py-6 md:py-8">
                <SectionHeader title={s.title} subtitle={s.subtitle} center={headerCenter} />
                <div className={`grid ${gridCls} gap-6`}>
                  {cols.map((c, i) => (
                    <div key={`${id}-col-${i + 1}`} className="rounded-lg border border-gray-200 p-4 md:p-6 bg-white shadow-sm" style={{ ...fg }}>
                      {(c.title || c.subtitle) ? (
                        <div className="mb-3">
                          {c.title ? (<h3 className="text-xl md:text-2xl font-semibold">{c.title}</h3>) : null}
                          {c.subtitle ? (<p className="text-sm text-gray-600">{c.subtitle}</p>) : null}
                        </div>
                      ) : null}
                      <RichHTML html={c.body} className={`prose-sm text-gray-600 ${roundImages ? 'about-img-200' : ''}`} />
                      {c.blocks ? <BlocksRenderer blocks={rewriteBlocksMedia(c.blocks, mediaBase)} roundImages={roundImages} imageSizePx={imageSizePx} /> : null}
                      {containsTable(c.body) ? (<StartButton text={ctaText} />) : null}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (type === 'media') {
            const url = rewriteMediaUrl(s.image, mediaBase);
            return (
              <section id={id} key={id} style={{ ...bg }} className="py-6 md:py-8">
                <SectionHeader title={s.title} subtitle={s.subtitle} center={headerCenter} />
            <div className="rounded-lg border border-gray-200 p-4 md:p-6 max-w-full mx-auto bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={s.title || 'Image'}
                      className={`${roundImages ? 'rounded-full object-cover w-[200px] h-[200px] mx-auto' : 'rounded-lg object-contain w-full h-auto'} shadow-sm`}
                      style={roundImages && imageSizePx ? { width: `${imageSizePx}px`, height: `${imageSizePx}px` } : undefined}
                    />
                  ) : null}
                  {s.body ? <RichHTML html={s.body} className={roundImages ? 'about-img-200' : ''} /> : null}
                  <StartButton text={ctaText} />
                </div>
              </section>
            );
          }

          if (type === 'video') {
            const raw = String(s.video_url || '');
            const isFile = /\.(mp4|webm|ogg)(\?.*)?$/i.test(raw) || raw.startsWith('/media/');
            const url = rewriteMediaUrl(raw, mediaBase);
            const isEmbed = /youtube\.com\/embed|youtu\.be\/|player\.vimeo\.com\/video\/|vimeo\.com\//i.test(raw);
            return (
              <section id={id} key={id} style={{ ...bg }} className="py-6 md:py-8">
                <SectionHeader title={s.title} subtitle={s.subtitle} center={headerCenter} />
                <div className="rounded-lg border border-gray-200 p-4 md:p-6 max-w-full mx-auto bg-white shadow-sm">
                  {url ? (
                    isFile ? (
                      <video src={url} controls className="w-full rounded-lg border border-gray-200 shadow-sm" />
                    ) : (
                      <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <iframe
                          src={url}
                          title={s.title || 'Embedded video'}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )
                  ) : null}
                  {s.body ? <RichHTML html={s.body} /> : null}
                  <StartButton text={ctaText} />
                </div>
              </section>
            );
          }

          if (type === 'gallery') {
            const items = Array.isArray(s.media) ? s.media : [];
            if ((s.layout || '').toLowerCase() === 'horizontal' || (s.layout || '').toLowerCase() === 'row') {
              return (
                <section id={id} key={id} style={{ ...bg }} className="py-6 md:py-8">
                  <div className="w-full max-w-7xl mx-auto">
                    <SectionHeader title={s.title} subtitle={s.subtitle} center={headerCenter} />
                    <div className="flex flex-wrap md:flex-nowrap gap-4">
                      {items.slice(0, 6).map((it, i) => {
                        const raw = typeof it === 'string' ? it : (it.url || it.image || '');
                        const url = rewriteMediaUrl(raw, mediaBase);
                        return (
                          <div key={`${id}-hmedia-${i}`} className="flex-1 min-w-[160px] rounded-lg overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={`Image ${i + 1}`}
                              className={`${roundImages ? 'rounded-full object-cover w-[200px] h-[200px] mx-auto' : 'object-cover w-full h-40 md:h-52'}`}
                              style={roundImages && imageSizePx ? { width: `${imageSizePx}px`, height: `${imageSizePx}px` } : undefined}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            }
            // Centered promo variant when layout is full: two images top, text and CTA below
            if ((s.layout || '').toLowerCase() === 'full') {
              const left = items[0];
              const right = items[1];
              const leftUrl = rewriteMediaUrl(typeof left === 'string' ? left : (left?.url || left?.image || ''), mediaBase);
              const rightUrl = rewriteMediaUrl(typeof right === 'string' ? right : (right?.url || right?.image || ''), mediaBase);
              const ctaText = (s.cta_text && String(s.cta_text).trim()) ? s.cta_text : 'Start Now';
              const ctaUrl = (s.cta_url && String(s.cta_url).trim()) ? s.cta_url : '#';
              return (
                <section id={id} key={id} style={{ ...bg }} className="py-6 md:py-8">
                  <div className="max-w-4xl mx-auto">
                    <SectionHeader title={s.title} subtitle={s.subtitle} center={headerCenter} />
                    <div className="rounded-lg border border-gray-200 p-4 md:p-6 bg-white shadow-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {leftUrl ? (
                          <div className="rounded-lg overflow-hidden shadow">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={leftUrl}
                              alt="Image 1"
                              className={`${roundImages ? 'rounded-full object-cover w-[200px] h-[200px] mx-auto' : 'object-cover w-full h-40 md:h-56'}`}
                              style={roundImages && imageSizePx ? { width: `${imageSizePx}px`, height: `${imageSizePx}px` } : undefined}
                            />
                          </div>
                        ) : null}
                        {rightUrl ? (
                          <div className="rounded-lg overflow-hidden shadow">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={rightUrl}
                              alt="Image 2"
                              className={`${roundImages ? 'rounded-full object-cover w-[200px] h-[200px] mx-auto' : 'object-cover w-full h-40 md:h-56'}`}
                              style={roundImages && imageSizePx ? { width: `${imageSizePx}px`, height: `${imageSizePx}px` } : undefined}
                            />
                          </div>
                        ) : null}
                      </div>
                      {s.body ? (
                        <div className="prose prose-sm md:prose mt-4">
                          <RichHTML html={s.body} />
                        </div>
                      ) : null}
                      <div className="mt-4">
                        <StartButton text={ctaText} href={ctaUrl} />
                      </div>
                    </div>
                  </div>
                </section>
              );
            }
            // Default gallery grid (featured-style)
            return (
              <section id={id} key={id} style={{ ...bg }} className="py-6 md:py-8">
                <SectionHeader title={s.title} subtitle={s.subtitle} center={headerCenter} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {items.map((it, i) => {
                    const raw = typeof it === 'string' ? it : (it.url || it.image || '');
                    const url = rewriteMediaUrl(raw, mediaBase);
                    return (
                      <div key={`${id}-media-${i}`} className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Media ${i + 1}`}
                          className={`${roundImages ? 'rounded-full object-cover w-[200px] h-[200px] mx-auto' : 'object-cover w-full h-32 md:h-40'}`}
                          style={roundImages && imageSizePx ? { width: `${imageSizePx}px`, height: `${imageSizePx}px` } : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (type === 'featured') {
            if (featuredShown) return null;
            featuredShown = true;
            const items = Array.isArray(s.items) ? s.items : [];
            return (
              <section id={id} key={id} style={{ ...bg }} className="py-6 md:py-8">
                <SectionHeader title={s.title} subtitle={s.subtitle} center={headerCenter} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {items.map((it, i) => {
                    const imgRaw = it.image || it.thumbnail || '';
                    const img = rewriteMediaUrl(imgRaw, mediaBase);
                    const href = it.url || '#';
                    return (
                      <div key={`${id}-feat-${i}`} className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {img ? (
                          <img
                            src={img}
                            alt={it.title || 'Featured'}
                            className={`${roundImages ? 'rounded-full object-cover w-[200px] h-[200px] mx-auto' : 'object-cover w-full h-32 md:h-40'}`}
                            style={roundImages && imageSizePx ? { width: `${imageSizePx}px`, height: `${imageSizePx}px` } : undefined}
                          />
                        ) : null}
                        <div className="p-4 space-y-2">
                          {it.title ? <h3 className="text-sm md:text-base font-semibold line-clamp-2">{it.title}</h3> : null}
                          {it.summary ? <p className="text-xs md:text-sm text-gray-600 line-clamp-3">{it.summary}</p> : null}
                          <div className="pt-2">
                            <a href={href} className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md bg-orange-600 text-white hover:bg-orange-700">
                              View
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (type === 'cta') {
            return (
              <section id={id} key={id} style={{ ...bg }} className="py-6 md:py-8">
                <SectionHeader title={s.title} subtitle={s.subtitle} />
                <div className="rounded-lg border border-gray-200 p-4 md:p-6 flex items-center justify-between bg-white">
                  <div className="prose max-w-none">
                    {s.body ? <RichHTML html={s.body} /> : <p className="text-gray-700">Ready to begin?</p>}
                  </div>
                  <StartButton text={ctaText} href={s.cta_url || '#'} />
                </div>
              </section>
            );
          }

          if (type === 'editor') {
            return (
              <section id={id} key={id} style={{ ...bg }} className="py-6 md:py-8">
                <SectionHeader title={s.title} subtitle={s.subtitle} />
                <div className="rounded-lg border border-gray-200 p-4 md:p-6 bg-white">
                  <BlocksRenderer blocks={s.editor_blocks} />
                </div>
              </section>
            );
          }

          // Fallback: show body if present
          return (
            <section id={id} key={id} style={{ ...bg }} className="py-6 md:py-8">
              <SectionHeader title={s.title} subtitle={s.subtitle} />
              <div className="rounded-lg border border-gray-200 p-4 md:p-6" style={{ ...fg }}>
                {s.body ? <RichHTML html={s.body} /> : <p className="text-gray-500">Unsupported section type: {type}</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// Helpers to rewrite /media URLs to absolute backend
function rewriteMediaUrl(url, base) {
  if (!url || !base) return url;
  if (typeof url !== 'string') return url;
  if (url.startsWith('/media/')) return `${base.replace(/\/$/, '')}${url}`;
  return url;
}

function rewriteBlocksMedia(blocks, base) {
  const arr = Array.isArray(blocks) ? blocks : (blocks?.blocks || []);
  const wrapped = Array.isArray(blocks) ? { blocks: blocks } : (blocks || { blocks: [] });
  const updated = arr.map(b => {
    const type = b.type || b.block_type || '';
    const data = { ...(b.data || b.value || {}) };
    if (type === 'image') {
      if (data.file?.url) data.file.url = rewriteMediaUrl(data.file.url, base);
      if (data.url) data.url = rewriteMediaUrl(data.url, base);
    }
    if (type === 'video') {
      if (data.file?.url) data.file.url = rewriteMediaUrl(data.file.url, base);
      if (data.url) data.url = rewriteMediaUrl(data.url, base);
    }
    return { ...b, data };
  });
  return { ...wrapped, blocks: updated };
}

function StartButton({ text = 'Start Now', href = '#hero' }) {
  return (
    <div className="pt-2 text-center">
      <SmartLink href={href} className="inline-flex items-center justify-center px-5 py-2.5 text-sm md:text-base font-semibold rounded-full bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition">
        {text}
      </SmartLink>
    </div>
  );
}