/**
 * A1-9: Dynamic per-page document meta — title, description, OG tags
 * Updates <head> tags reactively when the active page changes in the SPA.
 */
import { useEffect } from 'react';

interface MetaOptions {
  title: string;
  description?: string;
  ogImage?: string;
  path?: string;       // canonical path e.g. '/pricing'
  type?: 'website' | 'article';
}

const BASE_TITLE = 'WebWaka OS';
const BASE_URL   = 'https://webwaka.com';
const DEFAULT_OG = `${BASE_URL}/og-image.png`;
const DEFAULT_DESC = "Africa's AI-native Digital Transformation OS — POS, WakaPage, USSD, AI Advisory for 159+ business verticals.";

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useDocumentMeta({ title, description, ogImage, path = '/', type = 'website' }: MetaOptions) {
  useEffect(() => {
    const fullTitle = title === BASE_TITLE ? title : `${title} | ${BASE_TITLE}`;
    const desc = description ?? DEFAULT_DESC;
    const img  = ogImage ?? DEFAULT_OG;
    const url  = `${BASE_URL}${path}`;

    document.title = fullTitle;
    setMeta('description', desc);
    setLink('canonical', url);

    // OG
    setMeta('og:title',       fullTitle,   'property');
    setMeta('og:description', desc,        'property');
    setMeta('og:image',       img,         'property');
    setMeta('og:url',         url,         'property');
    setMeta('og:type',        type,        'property');

    // Twitter
    setMeta('twitter:title',       fullTitle, 'name');
    setMeta('twitter:description', desc,      'name');
    setMeta('twitter:image',       img,       'name');
  }, [title, description, ogImage, path, type]);
}
