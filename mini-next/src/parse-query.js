import { parse as parseUrl } from 'url';
// import { parse as parseQs } from 'querystring';

export const parseQuery = (req) => {
    const url = req.url;
    let parsedUrl = parseUrl(url, true);
    return parsedUrl;
};
