package com.race604.react.view.webview;

import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.CatalystStylesDiffMap;
import com.facebook.react.uimanager.ReactProp;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIProp;

/**
 * Created by Jing on 15/9/22.
 */
public class ReactWebViewManager extends SimpleViewManager<ObservableWebView> {

    public static final String REACT_CLASS = "RCTWebView";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected ObservableWebView createViewInstance(ThemedReactContext reactContext) {
        return new ObservableWebView(reactContext);
    }

    @ReactProp(name = "url")
    public void setUrl(final ObservableWebView webView, String url) {
        webView.loadUrl(url);
    }

    @ReactProp(name = "html")
    public void setHtml(final ObservableWebView webView, String html) {
        webView.loadData(html, "text/html; charset=utf-8", "UTF-8");
    }

}
