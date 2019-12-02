import generateETag from 'etag';
import fresh from 'fresh';
import { isResSent } from './utils';

export function sendHTML(ctx, html, { generateEtags }) {
    let { req, res } = ctx;
    if (isResSent(res)) return;
    const etag = generateEtags ? generateETag(html) : undefined;

    if (fresh(req.headers, { etag })) {
        res.statusCode = 304;
        res.end();
        return;
    }

    if (etag) {
        res.setHeader('ETag', etag);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Length', Buffer.byteLength(html));
    res.end(req.method === 'HEAD' ? null : html);
}
