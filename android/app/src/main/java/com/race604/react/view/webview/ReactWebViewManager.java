package com.race604.react.view.webview;

import com.facebook.react.uimanager.CatalystStylesDiffMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIProp;

/**
 * Created by Jing on 15/9/22.
 */
public class ReactWebViewManager extends SimpleViewManager<ObservableWebView> {

    public static final String REACT_CLASS = "RCTWebView";

    @UIProp(UIProp.Type.STRING)
    public static final String PROP_URL = "url";

    @UIProp(UIProp.Type.STRING)
    public static final String PROP_HTML = "html";

    @UIProp(UIProp.Type.STRING)
    public static final String PROP_CSS = "css";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected ObservableWebView createViewInstance(ThemedReactContext reactContext) {
        return new ObservableWebView(reactContext);
    }

    @Override
    public void updateView(final ObservableWebView webView, CatalystStylesDiffMap props) {
        super.updateView(webView, props);
        if (props.hasKey(PROP_URL)) {
            webView.loadUrl(props.getString(PROP_URL));
        }

        if (props.hasKey(PROP_HTML)) {
            String html = props.getString(PROP_HTML);
            if (props.hasKey(PROP_CSS)) {
                String css = props.getString(PROP_CSS);
                html = "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + css + "\" />" + html;
            }
            webView.loadData(html, "text/html; charset=utf-8", "UTF-8");
        }

    }
}
