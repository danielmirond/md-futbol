// Inline script injected in <head> to apply the persisted theme before paint.
// Prevents "flash of wrong theme" on page load.
export function ThemeScript() {
  const code = `
  (function(){
    try {
      var k = 'md-futbol:theme';
      var stored = localStorage.getItem(k);
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = stored || (prefersDark ? 'dark' : 'light');
      if (theme === 'dark') document.documentElement.classList.add('dark');
    } catch(e){}
  })();
  `
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}
