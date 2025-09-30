// Theme Variables and Font Weight Demo
// This file demonstrates how to use the new CSS variables and custom font weights

export function ThemeDemo() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-450 mb-8">Theme Variables & Font Weight Demo</h1>
      
      {/* Gray Color Scale Demo */}
      <section>
        <h2 className="text-xl font-600 mb-4">Gray Color Scale (Automatic Light/Dark)</h2>
        <div className="grid grid-cols-11 gap-2 mb-4">
          <div className="bg-gray-50 p-4 rounded text-center">
            <div className="text-gray-900 text-xs font-500">50</div>
          </div>
          <div className="bg-gray-100 p-4 rounded text-center">
            <div className="text-gray-900 text-xs font-500">100</div>
          </div>
          <div className="bg-gray-200 p-4 rounded text-center">
            <div className="text-gray-900 text-xs font-500">200</div>
          </div>
          <div className="bg-gray-300 p-4 rounded text-center">
            <div className="text-gray-900 text-xs font-500">300</div>
          </div>
          <div className="bg-gray-400 p-4 rounded text-center">
            <div className="text-gray-100 text-xs font-500">400</div>
          </div>
          <div className="bg-gray-500 p-4 rounded text-center">
            <div className="text-gray-100 text-xs font-500">500</div>
          </div>
          <div className="bg-gray-600 p-4 rounded text-center">
            <div className="text-gray-100 text-xs font-500">600</div>
          </div>
          <div className="bg-gray-700 p-4 rounded text-center">
            <div className="text-gray-100 text-xs font-500">700</div>
          </div>
          <div className="bg-gray-800 p-4 rounded text-center">
            <div className="text-gray-100 text-xs font-500">800</div>
          </div>
          <div className="bg-gray-900 p-4 rounded text-center">
            <div className="text-gray-100 text-xs font-500">900</div>
          </div>
          <div className="bg-gray-950 p-4 rounded text-center">
            <div className="text-gray-100 text-xs font-500">950</div>
          </div>
        </div>
      </section>

      {/* Red Color Scale Demo */}
      <section>
        <h2 className="text-xl font-600 mb-4">Red Color Scale (Automatic Light/Dark)</h2>
        <div className="grid grid-cols-11 gap-2 mb-4">
          <div className="bg-red-50 p-4 rounded text-center">
            <div className="text-red-900 text-xs font-500">50</div>
          </div>
          <div className="bg-red-100 p-4 rounded text-center">
            <div className="text-red-900 text-xs font-500">100</div>
          </div>
          <div className="bg-red-200 p-4 rounded text-center">
            <div className="text-red-900 text-xs font-500">200</div>
          </div>
          <div className="bg-red-300 p-4 rounded text-center">
            <div className="text-red-900 text-xs font-500">300</div>
          </div>
          <div className="bg-red-400 p-4 rounded text-center">
            <div className="text-red-100 text-xs font-500">400</div>
          </div>
          <div className="bg-red-500 p-4 rounded text-center">
            <div className="text-red-100 text-xs font-500">500</div>
          </div>
          <div className="bg-red-600 p-4 rounded text-center">
            <div className="text-red-100 text-xs font-500">600</div>
          </div>
          <div className="bg-red-700 p-4 rounded text-center">
            <div className="text-red-100 text-xs font-500">700</div>
          </div>
          <div className="bg-red-800 p-4 rounded text-center">
            <div className="text-red-100 text-xs font-500">800</div>
          </div>
          <div className="bg-red-900 p-4 rounded text-center">
            <div className="text-red-100 text-xs font-500">900</div>
          </div>
          <div className="bg-red-950 p-4 rounded text-center">
            <div className="text-red-100 text-xs font-500">950</div>
          </div>
        </div>
      </section>

      {/* Green Color Scale Demo */}
      <section>
        <h2 className="text-xl font-600 mb-4">Green Color Scale (Automatic Light/Dark)</h2>
        <div className="grid grid-cols-11 gap-2 mb-4">
          <div className="bg-green-50 p-4 rounded text-center">
            <div className="text-green-900 text-xs font-500">50</div>
          </div>
          <div className="bg-green-100 p-4 rounded text-center">
            <div className="text-green-900 text-xs font-500">100</div>
          </div>
          <div className="bg-green-200 p-4 rounded text-center">
            <div className="text-green-900 text-xs font-500">200</div>
          </div>
          <div className="bg-green-300 p-4 rounded text-center">
            <div className="text-green-900 text-xs font-500">300</div>
          </div>
          <div className="bg-green-400 p-4 rounded text-center">
            <div className="text-green-100 text-xs font-500">400</div>
          </div>
          <div className="bg-green-500 p-4 rounded text-center">
            <div className="text-green-100 text-xs font-500">500</div>
          </div>
          <div className="bg-green-600 p-4 rounded text-center">
            <div className="text-green-100 text-xs font-500">600</div>
          </div>
          <div className="bg-green-700 p-4 rounded text-center">
            <div className="text-green-100 text-xs font-500">700</div>
          </div>
          <div className="bg-green-800 p-4 rounded text-center">
            <div className="text-green-100 text-xs font-500">800</div>
          </div>
          <div className="bg-green-900 p-4 rounded text-center">
            <div className="text-green-100 text-xs font-500">900</div>
          </div>
          <div className="bg-green-950 p-4 rounded text-center">
            <div className="text-green-100 text-xs font-500">950</div>
          </div>
        </div>
      </section>

      {/* Blue Color Scale Demo */}
      <section>
        <h2 className="text-xl font-600 mb-4">Blue Color Scale (Automatic Light/Dark)</h2>
        <div className="grid grid-cols-11 gap-2 mb-4">
          <div className="bg-blue-50 p-4 rounded text-center">
            <div className="text-blue-900 text-xs font-500">50</div>
          </div>
          <div className="bg-blue-100 p-4 rounded text-center">
            <div className="text-blue-900 text-xs font-500">100</div>
          </div>
          <div className="bg-blue-200 p-4 rounded text-center">
            <div className="text-blue-900 text-xs font-500">200</div>
          </div>
          <div className="bg-blue-300 p-4 rounded text-center">
            <div className="text-blue-900 text-xs font-500">300</div>
          </div>
          <div className="bg-blue-400 p-4 rounded text-center">
            <div className="text-blue-100 text-xs font-500">400</div>
          </div>
          <div className="bg-blue-500 p-4 rounded text-center">
            <div className="text-blue-100 text-xs font-500">500</div>
          </div>
          <div className="bg-blue-600 p-4 rounded text-center">
            <div className="text-blue-100 text-xs font-500">600</div>
          </div>
          <div className="bg-blue-700 p-4 rounded text-center">
            <div className="text-blue-100 text-xs font-500">700</div>
          </div>
          <div className="bg-blue-800 p-4 rounded text-center">
            <div className="text-blue-100 text-xs font-500">800</div>
          </div>
          <div className="bg-blue-900 p-4 rounded text-center">
            <div className="text-blue-100 text-xs font-500">900</div>
          </div>
          <div className="bg-blue-950 p-4 rounded text-center">
            <div className="text-blue-100 text-xs font-500">950</div>
          </div>
        </div>
      </section>

      {/* Font Weight Demo */}
      <section>
        <h2 className="text-xl font-600 mb-4">Inter Font Weights</h2>
        <div className="space-y-2">
          <p className="font-100 text-gray-700">Font weight 100 - Thin</p>
          <p className="font-200 text-gray-700">Font weight 200 - Extra Light</p>
          <p className="font-300 text-gray-700">Font weight 300 - Light</p>
          <p className="font-350 text-gray-700">Font weight 350 - Custom Light</p>
          <p className="font-400 text-gray-700">Font weight 400 - Normal</p>
          <p className="font-450 text-gray-700">Font weight 450 - Custom Medium</p>
          <p className="font-500 text-gray-700">Font weight 500 - Medium</p>
          <p className="font-550 text-gray-700">Font weight 550 - Custom Medium+</p>
          <p className="font-600 text-gray-700">Font weight 600 - Semi Bold</p>
          <p className="font-650 text-gray-700">Font weight 650 - Custom Semi Bold+</p>
          <p className="font-700 text-gray-700">Font weight 700 - Bold</p>
          <p className="font-750 text-gray-700">Font weight 750 - Custom Bold+</p>
          <p className="font-800 text-gray-700">Font weight 800 - Extra Bold</p>
          <p className="font-850 text-gray-700">Font weight 850 - Custom Extra Bold+</p>
          <p className="font-900 text-gray-700">Font weight 900 - Black</p>
        </div>
      </section>

      {/* Text Color Demo */}
      <section>
        <h2 className="text-xl font-600 mb-4">Text Colors (Auto Theme-Aware)</h2>
        <div className="space-y-1">
          <p className="text-gray-50">text-gray-50 - This automatically adjusts for dark/light theme</p>
          <p className="text-gray-100">text-gray-100</p>
          <p className="text-gray-200">text-gray-200</p>
          <p className="text-gray-300">text-gray-300</p>
          <p className="text-gray-400">text-gray-400</p>
          <p className="text-gray-500">text-gray-500</p>
          <p className="text-gray-600">text-gray-600</p>
          <p className="text-gray-700">text-gray-700</p>
          <p className="text-gray-800">text-gray-800</p>
          <p className="text-gray-900">text-gray-900</p>
          <p className="text-gray-950">text-gray-950</p>
        </div>
      </section>

      {/* Combined Demo */}
      <section>
        <h2 className="text-xl font-600 mb-4">Combined Example</h2>
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-gray-900 font-650 text-lg mb-2">Card Title</h3>
          <p className="text-gray-600 font-450 mb-4">
            This card demonstrates the new theming system. The background is gray-50, 
            the title uses font-650 weight, and this text uses font-450 weight.
          </p>
          <button className="bg-gray-800 text-gray-100 px-4 py-2 rounded font-500 hover:bg-gray-700 transition-colors">
            Button with font-500
          </button>
        </div>
      </section>

      {/* Usage Examples */}
      <section>
        <h2 className="text-xl font-600 mb-4">How to Use</h2>
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-[13px]">
          <div className="space-y-2 text-gray-800">
            <div><span className="text-gray-600">// Custom font weights:</span></div>
            <div>className="font-450"  <span className="text-gray-600">// Custom medium weight</span></div>
            <div>className="font-550"  <span className="text-gray-600">// Custom medium+ weight</span></div>
            <div>className="font-650"  <span className="text-gray-600">// Custom semi-bold+ weight</span></div>
            <div></div>
            <div><span className="text-gray-600">// Theme-aware gray colors:</span></div>
            <div>className="text-gray-600"  <span className="text-gray-600">// Auto switches between light/dark</span></div>
            <div>className="bg-gray-100"   <span className="text-gray-600">// Background that adapts to theme</span></div>
            <div></div>
            <div><span className="text-gray-600">// CSS Variables (for custom styles):</span></div>
            <div>color: rgb(var(--gray-600))  <span className="text-gray-600">// Direct variable usage</span></div>
          </div>
        </div>
      </section>
    </div>
  )
}
