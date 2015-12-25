package com.race604.react.view.swiperefresh;

import android.os.SystemClock;
import android.support.v4.widget.SwipeRefreshLayout;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.race604.react.view.swiperefresh.event.RefreshEvent;

import java.util.Map;

import javax.annotation.Nullable;

/**
 * Created by Jing on 15/9/30.
 */
public class ReactSwipeRefreshLayoutManager extends ViewGroupManager<ReactSwipeRefreshLayout> {

    private static final String REACT_CLASS = "AndroidSwipeRefreshLayout";
    private static final String TAG = "NativeView";

    public static final int START_REFRESH = 1;
    public static final int FINISH_REFRESH = 2;

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected void addEventEmitters(ThemedReactContext reactContext, ReactSwipeRefreshLayout view) {
        view.setOnRefreshListener(
                new SwipeRefreshEventEmitter(
                        view,
                        reactContext.getNativeModule(UIManagerModule.class).getEventDispatcher()));
    }

    @Override
    protected ReactSwipeRefreshLayout createViewInstance(ThemedReactContext reactContext) {
        return new ReactSwipeRefreshLayout(reactContext);
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return true;
    }

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of("startRefresh", START_REFRESH, "finishRefresh", FINISH_REFRESH);
    }

    @Override
    public void receiveCommand(ReactSwipeRefreshLayout root, int commandId,
                               @Nullable ReadableArray args) {
        switch (commandId) {
            case START_REFRESH:
                root.setRefreshing(true);
                return;
            case FINISH_REFRESH:
                root.setRefreshing(false);
                return;
        }
    }

    @Nullable
    @Override
    public Map getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.of(
                RefreshEvent.EVENT_NAME, MapBuilder.of("registrationName", "onSwipeRefresh"));
    }

    @Override
    public void addView(ReactSwipeRefreshLayout parent, View child, int index) {
        if (getChildCount(parent) >= 2) {
            throw new
                    JSApplicationIllegalArgumentException("The SwipeRefreshLayout cannot have more than one children");
        }

        parent.addView(child, index);
    }

    public static class SwipeRefreshEventEmitter implements SwipeRefreshLayout.OnRefreshListener {

        private final SwipeRefreshLayout mSwipeRefreshLayout;
        private final EventDispatcher mEventDispatcher;

        public SwipeRefreshEventEmitter(SwipeRefreshLayout layout, EventDispatcher dispatcher) {
            mSwipeRefreshLayout = layout;
            mEventDispatcher = dispatcher;
        }

        @Override
        public void onRefresh() {
            mEventDispatcher.dispatchEvent(
                    new RefreshEvent(mSwipeRefreshLayout.getId(), SystemClock.uptimeMillis()));
        }
    }
}
