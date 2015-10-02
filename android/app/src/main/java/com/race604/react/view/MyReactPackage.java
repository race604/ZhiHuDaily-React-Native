package com.race604.react.view;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.react.uimanager.ViewManager;
import com.race604.react.view.swiperefresh.ReactSwipeRefreshLayoutManager;
import com.race604.react.view.webview.ReactWebViewManager;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by Jing on 15/9/22.
 */
public class MyReactPackage extends MainReactPackage {

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        List<ViewManager> main = super.createViewManagers(reactContext);
        List<ViewManager> result = new ArrayList<>();
        result.addAll(main);
        result.add(new ReactWebViewManager());
        result.add(new ReactSwipeRefreshLayoutManager());

        return result;
    }
}
