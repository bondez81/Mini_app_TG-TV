package com.teletv.player;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import java.io.File;

public class MainActivity extends Activity {
    
    private WebView webView;
    private static final String TAG = "TeleTV";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Log.i(TAG, "=== TeleTV Player Starting ===");
        Log.i(TAG, "Creating MainActivity");
        
        try {
            // Fullscreen
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN
            );
            
            Log.i(TAG, "Window configured");
            
            // Create WebView
            webView = new WebView(this);
            setContentView(webView);
            
            Log.i(TAG, "WebView created and set as content view");
            
            // Configure WebView
            WebSettings webSettings = webView.getSettings();
            webSettings.setJavaScriptEnabled(true);
            webSettings.setDomStorageEnabled(true);
            webSettings.setAllowFileAccess(true);
            webSettings.setAllowContentAccess(true);
            webSettings.setMediaPlaybackRequiresUserGesture(false);
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
            webSettings.setDatabaseEnabled(true);
            webSettings.setUseWideViewPort(true);
            webSettings.setLoadWithOverviewMode(true);
            webSettings.setSupportZoom(false);
            webSettings.setBuiltInZoomControls(false);
            
            Log.i(TAG, "WebView settings configured");
            
            // Enable debugging
            WebView.setWebContentsDebuggingEnabled(true);
            
            // Set WebViewClient to handle errors
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                    Log.e(TAG, "=== WebView Error ===");
                    Log.e(TAG, "URL: " + request.getUrl());
                    Log.e(TAG, "Error code: " + error.getErrorCode());
                    Log.e(TAG, "Error description: " + error.getDescription());
                    Toast.makeText(MainActivity.this, 
                        "Error: " + error.getDescription(), 
                        Toast.LENGTH_LONG).show();
                }
                
                @Override
                public void onPageFinished(WebView view, String url) {
                    Log.i(TAG, "=== Page Loaded ===");
                    Log.i(TAG, "URL: " + url);
                    super.onPageFinished(view, url);
                }
                
                @Override
                public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                    Log.i(TAG, "=== Page Loading Started ===");
                    Log.i(TAG, "URL: " + url);
                    super.onPageStarted(view, url, favicon);
                }
            });
            
            // Set WebChromeClient for console messages
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                    Log.i(TAG, "=== JS Console ===");
                    Log.i(TAG, "Level: " + consoleMessage.messageLevel());
                    Log.i(TAG, "Message: " + consoleMessage.message());
                    Log.i(TAG, "Source: " + consoleMessage.sourceId() + ":" + consoleMessage.lineNumber());
                    return true;
                }
            });
            
            Log.i(TAG, "WebView clients configured");
            
            // Check if assets exist
            String assetPath = "file:///android_asset/test.html";
            Log.i(TAG, "Attempting to load: " + assetPath);
            
            // Load test page for diagnostics
            webView.loadUrl(assetPath);
            
            // После подтверждения работы test.html, переключить на:
            // String assetPath = "file:///android_asset/index.html";
            
            Log.i(TAG, "=== MainActivity onCreate Complete ===");
            
        } catch (Exception e) {
            Log.e(TAG, "=== CRITICAL ERROR in onCreate ===");
            Log.e(TAG, "Exception: " + e.getMessage());
            Log.e(TAG, "Stack trace:", e);
            Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // Handle back button
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
