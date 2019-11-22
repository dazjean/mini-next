import { isResSent } from './utils';

export function getDisplayName(Component) {
    return typeof Component === 'string'
        ? Component
        : Component.displayName || Component.name || 'Unknown';
}
export async function loadGetInitialProps(App, ctx) {
    if (process.env.NODE_ENV !== 'production') {
        if (App.prototype && App.prototype.getInitialProps) {
            const message = `"${getDisplayName(
                App
            )}.getInitialProps(ctx ,query,pathname)" is defined as an instance method - visit https://err.sh/zeit/next.js/get-initial-props-as-an-instance-method for more information.`;
            throw new Error(message);
        }
    }
    // when npm run output ctx is null
    ctx = ctx || {};

    // when called from _app `ctx` is nested in `ctx`
    const res = ctx.res || (ctx.ctx && ctx.ctx.res);

    if (!App.getInitialProps) {
        if (ctx.ctx && ctx.Component) {
            return {
                pageProps: await loadGetInitialProps(ctx.Component, ctx.ctx)
            };
        }
        return {};
    }

    const props = await App.getInitialProps(
        ctx,
        (ctx.params && ctx.params.query) || null,
        (ctx.params && ctx.params.pathname) || null
    );

    if (res && isResSent(res)) {
        return props;
    }

    if (!props) {
        const message = `"${getDisplayName(
            App
        )}.getInitialProps()" should resolve to an object. But found "${props}" instead.`;
        throw new Error(message);
    }

    if (process.env.NODE_ENV !== 'production') {
        if (Object.keys(props).length === 0 && !ctx.ctx) {
            console.warn(
                `${getDisplayName(
                    App
                )} returned an empty object from \`getInitialProps\`. This de-optimizes and prevents automatic static optimization`
            );
        }
    }

    return props;
}
