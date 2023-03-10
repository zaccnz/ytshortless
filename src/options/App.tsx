import { useContext, useEffect, useRef } from 'react'
import { ConfigContext, ConfigProvider } from '@/ConfigProvider'

function App() {
  const { updateConfig, ...config } = useContext(ConfigContext);
  const enabledRef = useRef<HTMLInputElement>(null);
  const homeRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLInputElement>(null);
  const subBoxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', config.dark_theme ? 'dark' : 'light');
  }, [config.dark_theme]);

  const save = () => {
    updateConfig(config => {
      config = { ...config };

      enabledRef.current && (config.enabled = enabledRef.current.checked);
      homeRef.current && (config.remove_home = homeRef.current.checked);
      sidebarRef.current && (config.remove_sidebar = sidebarRef.current.checked);
      subBoxRef.current && (config.remove_sub_box = subBoxRef.current.checked);

      return config;
    });
  };

  return (
    <div className="bg-base-200 min-h-full h-full">
      <div className="mx-auto flex flex-col min-h-full">
        <header className="py-20 flex items-center justify-center text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">
              <span>yt</span>
              shortless options
            </h1>
            <p className="py-6">
              you have blocked <span>{config.blocked}</span> shorts (and counting...)
            </p>
          </div>
        </header>
        <main className="pb-20 flex-1">
          <form
            className="card w-96 bg-base-100 shadow-xl mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="card-body">
              <div className="form-control pb-4">
                <label className="label cursor-pointer">
                  <span className="label-text text-2xl">
                    {config.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <input
                    type="checkbox" checked={config.enabled}
                    ref={enabledRef} onChange={() => save()}
                    className="toggle toggle-accent"
                  />
                </label>
              </div>
              <h3 className="label text-xl">Remove shorts from</h3>
              <div className="form-control  bg-base-200 hover:bg-base-300 rounded-lg px-4 py-2">
                <label className="label cursor-pointer">
                  <span className="label-text">Home</span>
                  <input
                    type="checkbox" checked={config.remove_home}
                    ref={homeRef} onChange={() => save()}
                    className="checkbox checked:checkbox-accent"
                  />
                </label>
              </div>
              <div className="form-control bg-base-200 hover:bg-base-300 rounded-lg px-4 py-2">
                <label className="label cursor-pointer">
                  <span className="label-text">Sidebar</span>
                  <input
                    type="checkbox" checked={config.remove_sidebar}
                    ref={sidebarRef} onChange={() => save()}
                    className="checkbox checked:checkbox-accent"
                  />
                </label>
              </div>
              <div className="form-control bg-base-200 hover:bg-base-300 rounded-lg px-4 py-2">
                <label className="label cursor-pointer">
                  <span className="label-text">Sub Box</span>
                  <input
                    type="checkbox" checked={config.remove_sub_box}
                    ref={subBoxRef} onChange={() => save()}
                    className="checkbox checked:checkbox-accent"
                  />
                </label>
              </div>
            </div>
          </form>
        </main>
        <footer className="flex-0 py-8">
          <p className="text-center">
            made by zac in 2023. view the source code on
            {' '}<a className="link link-accent" href="https://github.com/zaccnz/ytshortless">github</a>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App