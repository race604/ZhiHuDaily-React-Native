package com.race604.react.view.swiperefresh;

import android.support.v4.widget.SwipeRefreshLayout;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ScrollView;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.events.NativeGestureUtil;

/**
 * Created by Jing on 15/9/30.
 */
public class ReactSwipeRefreshLayout extends SwipeRefreshLayout {

    private static final String TAG = "NativeView";
    private ScrollView mScrollChild = null;

    public ReactSwipeRefreshLayout(ReactContext context) {
        super(context);
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {

        if (mScrollChild != null && mScrollChild.getScrollY() > 0) {
            return false;
        }

        if (super.onInterceptTouchEvent(ev)) {
            NativeGestureUtil.notifyNativeGestureStarted(this, ev);
            return true;
        }

        return false;
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        mScrollChild = findScrollChild(this);
    }

    private ScrollView findScrollChild(View root) {
        View child = root;
        while (child instanceof ViewGroup) {
            child = ((ViewGroup) child).getChildAt(0);
            if (child instanceof ScrollView) {
                return (ScrollView) child;
            }
        }
        return null;
    }
}
