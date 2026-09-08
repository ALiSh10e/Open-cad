package com.opencadatlas.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import com.opencadatlas.mobile.ui.AtlasApp
import com.opencadatlas.mobile.ui.AtlasViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { AtlasApp(viewModel<AtlasViewModel>()) }
    }
}
