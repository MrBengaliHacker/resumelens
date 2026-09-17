import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";

export const meta = () => ([
  { title: "ResumeLens | App Data" },
  { name: "description", content: "Manage locally stored resume data" },
])

const WipeApp = () => {
  const { auth, isLoading, error, fs, kv } = usePuterStore();
  const navigate = useNavigate();

  const [files, setFiles] = useState<FSItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [wiping, setWiping] = useState(false);

  const loadFiles = async () => {
    setLoadingFiles(true);

    try {
      const files = (await fs.readDir("./")) as FSItem[];
      setFiles(files || []);
    } catch (error) {
      console.error("Failed to load files:", error);
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  const handleDelete = async () => {
    setWiping(true);

    try {
      await Promise.all(files.map((file) => fs.delete(file.path)));
      await kv.flush();
      setConfirming(false);
      await loadFiles();
    } catch (error) {
      console.error("Failed to wipe app data:", error);
    } finally {
      setWiping(false);
    }
  };

  if (isLoading) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
        <img src="/images/resume-scan-2.gif" className="w-40" alt="Loading"/>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
        <div className="gradient-border w-fit">
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>App Data</h1>
          <h2>
            Signed in as{" "}
            <span className="font-semibold">{auth.user?.username}</span>
          </h2>
        </div>

        <div className="gradient-border w-full max-w-2xl">
          <div className="bg-white rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-black">Stored files</h3>

            {loadingFiles && (
              <p className="text-gray-500 text-sm">Loading files...</p>
            )}

            {!loadingFiles && files.length === 0 && (
              <p className="text-gray-500 text-sm">No files stored.</p>
            )}

            {!loadingFiles && files.length > 0 && (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-row gap-4 bg-gray-50 rounded-lg px-4 py-2"
                  >
                    <p className="text-sm text-gray-700 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              {!confirming ? (
                <button
                  className="bg-red-50 text-red-600 font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-red-100 transition-colors disabled:opacity-50"
                  onClick={() => setConfirming(true)}
                  disabled={files.length === 0}
                >
                  Wipe App Data
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-red-600 font-medium">
                    This will permanently delete all{" "} 
                    {files.length} stored file
                    {files.length === 1 ? "" : "s"} and resume records. This
                    can't be undone.
                  </p>
                  <div className="flex flex-row gap-3">
                    <button
                      className="bg-red-600 text-white font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors disabled:opacity-50"
                      onClick={handleDelete}
                      disabled={wiping}
                    >
                      {wiping ? "Wiping..." : "Yes, delete everything"}
                    </button>
                    <button
                      className="border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50"
                      onClick={() => setConfirming(false)}
                      disabled={wiping}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default WipeApp;
